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
  
  allTrainings: Training[] = [];      // Liste reçue de l'API (déjà filtrée par le serveur)
  filteredTrainings: Training[] = []; // Liste après filtrage local (si besoin de filtres supplémentaires non gérés par API)
  paginatedTrainings: Training[] = [];
  
  searchTerm: string = '';
  isLoading: boolean = true;
  
  private routerSubscription: Subscription | undefined;

  // --- Tri et Tags ---
  sortOption: string = 'newest';
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
    // 1. Chargement initial
    this.loadData();

    // 2. Écouter le rechargement
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

  // --- CHARGEMENT INTELLIGENT (API BACKEND) ---
  loadData() {
    this.isLoading = true;
    
    // 1. Préparation des filtres pour l'API
    const apiFilters: any = {};

    // A. Recherche
    if (this.searchTerm) apiFilters.search = this.searchTerm;

    // B. Format (Online / In Person)
    if (this.activeFilters.format) {
       // L'API attend 'online' ou 'inPerson'
       if (this.activeFilters.format === 'Online') apiFilters.format = 'online';
       if (this.activeFilters.format === 'In Person') apiFilters.format = 'inPerson';
    }

    // C. Prix (Free / Paid)
    if (this.activeFilters.price) {
       if (this.activeFilters.price === 'Free') apiFilters.price = 'free';
       if (this.activeFilters.price === 'Paid') apiFilters.price = 'paid';
    }

    // 2. Appel API (qui fait le travail de filtrage)
    this.opportunityService.getTrainings(apiFilters).subscribe({
      next: (data: Opportunity[]) => {
        
        // 3. Mapping vers le modèle Training
        this.allTrainings = data.map(op => this.mapToTraining(op));
        
        // 4. Filtrage "Fin" Client-Side (Catégories)
        // Comme l'API formations n'a pas (encore) de paramètre ?category=dev, on le fait ici
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

  // Cette méthode applique les filtres de "Catégorie" (Dev, Design...) sur les données reçues
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
    this.sortResults();
    this.calculatePagination();
  }

  // --- GESTION DES ACTIONS ---

  // Déclenché par la Sidebar ou la Recherche
  applyFilters() {
    this.currentPage = 1;
    // On rappelle loadData car Prix/Format/Search nécessitent un appel API
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
    if (this.sortOption === 'newest') {
      this.filteredTrainings.sort((a, b) => Number(b.id) - Number(a.id));
    } else if (this.sortOption === 'oldest') {
      this.filteredTrainings.sort((a, b) => Number(a.id) - Number(b.id));
    }
  }

  // --- LOGIQUE DES TAGS VISUELS ---
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

  // --- PAGINATION ---
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

  // --- MAPPING ---
  private mapToTraining(op: Opportunity): Training {
    const desc = op.description || '';
    const text = (op.title + ' ' + desc).toLowerCase();
    
    // Logique Catégorie
    let cat = 'General';
    if (text.includes('code') || text.includes('stack') || text.includes('web') || text.includes('python') || text.includes('dev')) {
        cat = 'Development';
    } else if (text.includes('design') || text.includes('ux') || text.includes('ui') || text.includes('graphisme')) {
        cat = 'Design';
    } else if (text.includes('business') || text.includes('marketing') || text.includes('lead') || text.includes('gestion')) {
        cat = 'Business';
    } else if (text.includes('data') || text.includes('analytics') || text.includes('donnée') || text.includes('ia')) {
        cat = 'Data Science';
    }

    // Logique Badge
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