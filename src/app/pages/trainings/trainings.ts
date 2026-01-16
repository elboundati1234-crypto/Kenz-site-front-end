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
  
  allTrainings: Training[] = [];
  filteredTrainings: Training[] = [];
  paginatedTrainings: Training[] = [];
  
  searchTerm: string = '';
  isLoading: boolean = true;
  
  private routerSubscription: Subscription | undefined;

  // --- Tri et Tags ---
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
        // Mapping des données brutes vers le modèle Training avec les nouvelles catégories
        this.allTrainings = data.map(op => this.mapToTraining(op));
        
        // Application des filtres locaux (ex: Design & Art)
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
            // On inclut "Design & Art" ici
            if (f.design && (t.category === 'Design' || t.category === 'Design & Art')) return true;
            if (f.business && t.category === 'Business') return true;
            if (f.data && t.category === 'Data Science') return true;
            return false;
        });
    }

    this.updateActiveTags();
    this.sortResults(); 
    this.calculatePagination();
  }

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

  onSortChange() {
    this.sortResults();
    this.currentPage = 1;
    this.calculatePagination();
  }

  sortResults() {
    if (this.sortOption === 'newest') {
      this.filteredTrainings.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    } else if (this.sortOption === 'price_asc') {
      this.filteredTrainings.sort((a, b) => {
        const isAFree = a.badgeType === 'Free';
        const isBFree = b.badgeType === 'Free';
        if (isAFree && !isBFree) return -1;
        if (!isAFree && isBFree) return 1; 
        return 0;
      });
    } else {
        this.filteredTrainings.sort((a, b) => String(b.id).localeCompare(String(a.id)));
    }
  }

  updateActiveTags() {
    this.activeTags = [];
    const f = this.activeFilters;

    if (f.price === 'Free') this.activeTags.push({ key: 'price', label: 'Free Only' });
    if (f.price === 'Paid') this.activeTags.push({ key: 'price', label: 'Paid Only' });
    
    if (f.development) this.activeTags.push({ key: 'development', label: 'Development' });
    if (f.design) this.activeTags.push({ key: 'design', label: 'Design & Art' }); // Label mis à jour
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

  // --- LOGIQUE DE MAPPING CATÉGORIE ---
  private mapToTraining(op: Opportunity): Training {
    // Note: OpportunityService met la filière dans la description sous la forme "[Filiere] Description..."
    const desc = op.description || '';
    const title = op.title || '';
    const text = (title + ' ' + desc).toLowerCase();
    
    let cat = 'General';

    // 1. DATA SCIENCE (Priorité aux mots clés Machine Learning, Data, Analysis)
    if (text.includes('machine learning') || text.includes('data analysis') || text.includes('data science') || text.includes('big data') || text.includes('intelligence artificielle') || text.includes('ia')) {
        cat = 'Data Science';
    } 
    // 2. DESIGN & ART (Priorité aux mots clés UX, UI, Design)
    else if (text.includes('ux') || text.includes('ui') || text.includes('design') || text.includes('art') || text.includes('graphisme') || text.includes('creative')) {
        cat = 'Design & Art';
    } 
    // 3. BUSINESS
    else if (text.includes('business') || text.includes('marketing') || text.includes('management') || text.includes('finance') || text.includes('entrepreneuriat')) {
        cat = 'Business';
    } 
    // 4. DEVELOPMENT (Tout ce qui reste lié au code)
    else if (text.includes('dev') || text.includes('code') || text.includes('stack') || text.includes('web') || text.includes('cloud') || text.includes('react') || text.includes('java') || text.includes('python')) {
        cat = 'Development';
    }

    // Gestion du Badge
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
      category: cat, // La catégorie est maintenant correctement assignée
      organization: op.organization,
      image: op.imageUrl,
      duration: op.duration || 'Self-paced',
      description: desc,
      badgeType: badge,
      isCertified: benefitsSafe.includes('certified') || benefitsSafe.includes('certificat') || false
    };
  }
}