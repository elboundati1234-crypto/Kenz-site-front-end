import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, NavigationEnd } from '@angular/router'; // AJOUT: Router imports
import { Subscription } from 'rxjs'; // AJOUT: Subscription

import { OpportunityService } from '../../services/opportunity';
import { Opportunity } from '../../models/opportunity';
import { Training } from '../../models/training';

import { TrainingCardComponent } from '../../components/training-card/training-card';
import { TrainingFilterComponent } from '../../components/training-filter/training-filter';

// Interface pour les tags visuels (filtres actifs)
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
  isLoading: boolean = true; // Pour gérer l'état de chargement

  // Gestion Navigation
  private routerSubscription: Subscription | undefined;

  // --- Tri et Tags ---
  sortOption: string = 'newest';
  activeTags: FilterTag[] = [];
  activeFilters: any = {}; 
  
  // --- Pagination ---
  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;
  pagesArray: number[] = [];

  constructor(
    private opportunityService: OpportunityService,
    private router: Router, // Injection Router
    private cdr: ChangeDetectorRef // Injection ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 1. Chargement initial
    this.loadData();

    // 2. Écouter le rechargement (clic menu alors qu'on est déjà sur la page)
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.loadData(); // Recharger les données
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // --- CHARGEMENT DES DONNÉES ---
  loadData() {
    this.isLoading = true;
    
    this.opportunityService.getOpportunities().subscribe({
      next: (data: Opportunity[]) => {
        // 1. Filtrer les opportunités de type 'Training'
        // ATTENTION : Utilisez bien 'opportuniteType' si vous avez changé le modèle
        const rawData = data.filter(op => op.opportuniteType === 'Training');
        
        // 2. Mapper vers le modèle Training
        this.allTrainings = rawData.map(op => this.mapToTraining(op));
        
        // 3. Init
        this.filteredTrainings = [...this.allTrainings];
        this.sortResults();
        this.calculatePagination();
        
        this.isLoading = false;
        
        // FORCER LA MISE À JOUR DE LA VUE
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement trainings:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- LOGIQUE DE TRI ---
  onSortChange() {
    this.sortResults();
    this.currentPage = 1;
    this.calculatePagination();
  }

  sortResults() {
    // Conversion en Number pour éviter les erreurs de soustraction sur des strings
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

  handleReset() {
    this.searchTerm = '';
    this.activeFilters = {}; 
    this.applyFilters();
  }

  // --- FILTRAGE PRINCIPAL ---
  handleFilterChange(filters: any) {
    this.activeFilters = filters;
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  applyFilters() {
    const f = this.activeFilters;

    this.filteredTrainings = this.allTrainings.filter(t => {
      // 1. Recherche Texte
      const term = this.searchTerm.toLowerCase();
      const matchSearch = t.title.toLowerCase().includes(term) || (t.description || '').toLowerCase().includes(term);
      
      // 2. Filtre Prix
      let matchPrice = true;
      if (f.price === 'Free' && t.badgeType !== 'Free') matchPrice = false;
      if (f.price === 'Paid' && t.badgeType === 'Free') matchPrice = false;

      // 3. Filtre Catégorie
      let matchCategory = true;
      const catChecked = f.development || f.design || f.business || f.data;
      if (catChecked) {
          matchCategory = false; 
          if (f.development && t.category === 'Development') matchCategory = true;
          if (f.design && t.category === 'Design') matchCategory = true;
          if (f.business && t.category === 'Business') matchCategory = true;
          if (f.data && t.category === 'Data Science') matchCategory = true;
      }

      // 4. Filtre Format 
      return matchSearch && matchPrice && matchCategory;
    });

    this.updateActiveTags();
    this.sortResults();
    this.currentPage = 1;
    this.calculatePagination();
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

  // --- MAPPING (SÉCURISÉ & MULTILINGUE) ---
  private mapToTraining(op: Opportunity): Training {
    const desc = op.description || '';
    const text = (op.title + ' ' + desc).toLowerCase();
    
    // Logique Catégorie (Français & Anglais)
    let cat = 'General';
    if (text.includes('code') || text.includes('stack') || text.includes('web') || text.includes('python') || text.includes('dev') || text.includes('programmation')) {
        cat = 'Development';
    } else if (text.includes('design') || text.includes('ux') || text.includes('ui') || text.includes('graphisme')) {
        cat = 'Design';
    } else if (text.includes('business') || text.includes('marketing') || text.includes('lead') || text.includes('gestion') || text.includes('management')) {
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