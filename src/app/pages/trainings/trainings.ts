import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

import { OpportunityService } from '../../services/opportunity';
import { Opportunity } from '../../models/opportunity';
import { Training } from '../../models/training';

import { TrainingCardComponent } from '../../components/training-card/training-card';
import { TrainingFilterComponent } from '../../components/training-filter/training-filter';

interface FilterTag {
  key: string;
  label: string;
}

@Component({
  selector: 'app-trainings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TrainingCardComponent, TrainingFilterComponent],
  templateUrl: './trainings.html',
  styleUrls: ['./trainings.css']
})
export class TrainingsComponent implements OnInit, OnDestroy {
  
  allTrainings: Training[] = [];      // Données brutes
  filteredTrainings: Training[] = []; // Données filtrées et triées
  paginatedTrainings: Training[] = []; // Données de la page visible
  
  searchTerm: string = '';
  isLoading: boolean = true;
  
  private routerSubscription: Subscription | undefined;

  // --- Tri et Tags ---
  // Valeur par défaut 'relevant' pour correspondre au HTML
  sortOption: string = 'relevant'; 
  activeTags: FilterTag[] = [];
  
  // --- Pagination ---
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;
  pagesArray: number[] = [];

  // --- Filtres ---
  activeFilters: any = {}; 

  constructor(
    private opportunityService: OpportunityService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.loadData();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadData() {
    this.isLoading = true;
    
    const apiFilters: any = {};
    if (this.searchTerm) apiFilters.search = this.searchTerm;
    if (this.activeFilters.format) {
       if (this.activeFilters.format === 'Online') apiFilters.format = 'online';
       if (this.activeFilters.format === 'In Person') apiFilters.format = 'inPerson';
    }
    if (this.activeFilters.price) {
       if (this.activeFilters.price === 'Free') apiFilters.price = 'free';
       if (this.activeFilters.price === 'Paid') apiFilters.price = 'paid';
    }

    this.opportunityService.getTrainings(apiFilters).subscribe({
      next: (data: Opportunity[]) => {
        this.allTrainings = data.map(op => this.mapToTraining(op));
        this.applyClientSideCategoryFilters();
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement trainings:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyClientSideCategoryFilters() {
    const f = this.activeFilters;
    const catChecked = f.development || f.design || f.business || f.data;

    if (!catChecked) {
        this.filteredTrainings = [...this.allTrainings];
    } else {
        this.filteredTrainings = this.allTrainings.filter(t => {
            if (f.development && t.category === 'Development') return true;
            if (f.design && t.category === 'Design') return true;
            if (f.business && t.category === 'Business') return true;
            if (f.data && t.category === 'Data Science') return true;
            return false;
        });
    }

    this.updateActiveTags();
    this.sortResults(); // On trie après avoir filtré
    this.calculatePagination();
  }

  // --- GESTION DES ACTIONS ---

  applyFilters() {
    this.currentPage = 1;
    this.loadData();
  }

  handleFilterChange(newFilters: any) {
    this.activeFilters = newFilters;
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  handleReset() {
    this.searchTerm = '';
    this.activeFilters = {}; 
    this.applyFilters();
  }

  // --- LOGIQUE DE TRI ---
  onSortChange() {
    this.sortResults();
    this.currentPage = 1;
    this.calculatePagination();
  }

  sortResults() {
    // 1. Tri "Newest" : ID décroissant (le plus grand ID est le plus récent dans MongoDB)
    if (this.sortOption === 'newest') {
      this.filteredTrainings.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    } 
    
    // 2. Tri "Price: Low to High" : Les gratuits ('Free') d'abord
    else if (this.sortOption === 'price_asc') {
      this.filteredTrainings.sort((a, b) => {
        const isAFree = a.badgeType === 'Free';
        const isBFree = b.badgeType === 'Free';

        if (isAFree && !isBFree) return -1; // A vient avant B
        if (!isAFree && isBFree) return 1;  // B vient avant A
        return 0; // Pas de changement
      });
    } 
    
    // 3. Tri "Most Relevant" : Par défaut (souvent ID décroissant pour voir les nouveautés)
    else {
        // Fallback sur le plus récent
        this.filteredTrainings.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    }
  }

  updateActiveTags() {
    this.activeTags = [];
    const f = this.activeFilters;

    if (f.price === 'Free') this.activeTags.push({ key: 'price', label: 'Free Only' });
    if (f.price === 'Paid') this.activeTags.push({ key: 'price', label: 'Paid Only' });
    
    if (f.development) this.activeTags.push({ key: 'development', label: 'Development' });
    if (f.design) this.activeTags.push({ key: 'design', label: 'Design' });
    if (f.business) this.activeTags.push({ key: 'business', label: 'Business' });
    if (f.data) this.activeTags.push({ key: 'data', label: 'Data Science' });

    if (f.format === 'Online') this.activeTags.push({ key: 'format', label: 'Online' });
    if (f.format === 'InPerson') this.activeTags.push({ key: 'format', label: 'In Person' });
  }

  removeTag(tag: FilterTag) {
    if (tag.key === 'price' || tag.key === 'format') {
        this.activeFilters[tag.key] = 'All'; 
    } else {
        this.activeFilters[tag.key] = false;
    }
    this.applyFilters();
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredTrainings.length / this.itemsPerPage);
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    
    if (this.currentPage > this.totalPages) this.currentPage = 1;
    if (this.totalPages === 0) this.currentPage = 1;
    
    this.updatePaginatedList();
  }

  updatePaginatedList() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedTrainings = this.filteredTrainings.slice(startIndex, endIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedList();
    }
  }

  private mapToTraining(op: Opportunity): Training {
    const desc = op.description || '';
    const text = (op.title + ' ' + desc).toLowerCase();
    
    let cat = 'General';
    if (text.includes('code') || text.includes('stack') || text.includes('web') || text.includes('python') || text.includes('dev') || text.includes('java')) {
        cat = 'Development';
    } else if (text.includes('design') || text.includes('ux') || text.includes('ui') || text.includes('graphisme')) {
        cat = 'Design';
    } else if (text.includes('business') || text.includes('marketing') || text.includes('lead') || text.includes('gestion')) {
        cat = 'Business';
    } else if (text.includes('data') || text.includes('analytics') || text.includes('donnée') || text.includes('ia') || text.includes('intelligence')) {
        cat = 'Data Science';
    }

    let badge: 'Featured' | 'Popular' | 'Free' | undefined = undefined;
    const valSafe = (op.value || '').toLowerCase();
    const tagsSafe = op.tags || [];

    if (valSafe.includes('free') || valSafe === '0' || valSafe.includes('gratuit')) badge = 'Free';
    else if (tagsSafe.includes('Featured')) badge = 'Featured';
    else if (tagsSafe.includes('Popular')) badge = 'Popular';

    const benefitsSafe = (op.benefits || '').toLowerCase();

    return {
      id: op.id as any, 
      title: op.title,
      category: cat,
      organization: op.organization,
      image: op.imageUrl,
      duration: op.duration || 'Self-paced',
      description: desc,
      badgeType: badge,
      isCertified: benefitsSafe.includes('certified') || benefitsSafe.includes('certificat') || false
    };
  }
}