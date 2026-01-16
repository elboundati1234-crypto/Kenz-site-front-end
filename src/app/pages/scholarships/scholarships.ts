import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router'; 
import { Subscription } from 'rxjs';

import { OpportunityService } from '../../services/opportunity';
import { Opportunity } from '../../models/opportunity';
import { Scholarship } from '../../models/scholarship';

import { ScholarshipCardComponent } from '../../components/scholarship-card/scholarship-card';
import { FilterSidebarComponent } from '../../components/filter-sidebar/filter-sidebar';

interface FilterTag {
  key: string;
  label: string;
}

@Component({
  selector: 'app-scholarships',
  standalone: true,
  imports: [CommonModule, FormsModule, ScholarshipCardComponent, FilterSidebarComponent],
  templateUrl: './scholarships.html',
  styleUrls: ['./scholarships.css']
})
export class ScholarshipsComponent implements OnInit, OnDestroy {

  // Données
  allScholarships: Scholarship[] = [];      // Tous les résultats renvoyés par l'API
  filteredScholarships: Scholarship[] = []; // Résultats après filtre "tags" (Engineering...)
  paginatedScholarships: Scholarship[] = []; // Page courante
  
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
  activeFilters: any = {
    engineering: false, medical: false, business: false, arts: false, cs: false,
    undergrad: false, masters: false, phd: false, closingSoon: false, location: 'Any Location'
  };

  constructor(
    private opportunityService: OpportunityService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 1. Chargement initial
    this.loadData();

    // 2. Gestion du rechargement via Router
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

  // --- CHARGEMENT INTELLIGENT (API + FILTRES) ---
  loadData() {
    this.isLoading = true;

    // 1. Préparation des filtres pour l'API
    const apiFilters: any = {};

    // A. Recherche Texte
    if (this.searchTerm) apiFilters.search = this.searchTerm;

    // B. Localisation
    if (this.activeFilters.location && this.activeFilters.location !== 'Any Location') {
      apiFilters.pays = this.activeFilters.location;
    }

    // C. Niveau (API attend 'niveau')
    // On priorise le niveau le plus élevé si plusieurs sont cochés, ou on adapte selon logique métier
    if (this.activeFilters.phd) apiFilters.niveau = 'Doctorat';
    else if (this.activeFilters.masters) apiFilters.niveau = 'Master';
    else if (this.activeFilters.undergrad) apiFilters.niveau = 'Licence';

    // D. Closing Soon
    if (this.activeFilters.closingSoon) apiFilters.closingSoon = true;

    // 2. Appel API
    this.opportunityService.getScholarships(apiFilters).subscribe({
      next: (data: Opportunity[]) => {
        
        // 3. Mapping des résultats
        // On récupère les données pré-filtrées par le serveur (Pays, Niveau, Texte, Date)
        this.allScholarships = data.map(op => this.mapOpportunityToScholarship(op));
        
        // 4. Filtrage "Fin" Client-Side (Domaines d'études)
        // Comme l'API bourses n'a pas (encore) de paramètre ?field=engineering, on le fait ici
        this.applyClientSideDomainFilters();

        this.isLoading = false;
        this.cdr.detectChanges(); // Force l'affichage
      },
      error: (err) => {
        console.error("Erreur chargement Bourses:", err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Cette méthode applique les filtres de "Domaine" (Engineering, Medical...) 
  // sur les données déjà reçues de l'API.
  applyClientSideDomainFilters() {
    const f = this.activeFilters;
    const hasFieldFilter = f.engineering || f.medical || f.business || f.arts || f.cs;

    if (!hasFieldFilter) {
      // Si aucun domaine coché, on garde tout ce que l'API a envoyé
      this.filteredScholarships = [...this.allScholarships];
    } else {
      // Sinon, on filtre localement
      this.filteredScholarships = this.allScholarships.filter(item => {
        const itemTags = item.tags ? item.tags.map(t => t.toLowerCase()) : [];
        let match = false;
        
        if (f.engineering && itemTags.includes('engineering')) match = true;
        if (f.medical && itemTags.includes('medical')) match = true;
        if (f.business && itemTags.includes('business')) match = true;
        if (f.arts && itemTags.includes('arts')) match = true;
        if (f.cs && itemTags.includes('cs')) match = true;
        
        return match;
      });
    }

    this.updateActiveTags();
    this.sortResults();       // Tri local
    this.calculatePagination(); // Pagination locale
  }

  // --- GESTION DES ACTIONS UTILISATEUR ---

  // Déclenché par la Sidebar ou la Recherche
  applyFilters() {
    this.currentPage = 1;
    // On rappelle loadData car certains filtres (Pays, Niveau) nécessitent un appel API
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
    // Reset des filtres actifs
    this.activeFilters = {
        engineering: false, medical: false, business: false, arts: false, cs: false,
        undergrad: false, masters: false, phd: false, closingSoon: false, location: 'Any Location'
    };
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
      this.filteredScholarships.sort((a, b) => Number(b.id) - Number(a.id)); 
    } else if (this.sortOption === 'oldest') {
      this.filteredScholarships.sort((a, b) => Number(a.id) - Number(b.id));
    }
  }

  // --- LOGIQUE DES TAGS VISUELS ---
  updateActiveTags() {
    this.activeTags = [];
    const f = this.activeFilters;

    if (f.engineering) this.activeTags.push({ key: 'engineering', label: 'Engineering' });
    if (f.medical) this.activeTags.push({ key: 'medical', label: 'Medical' });
    if (f.business) this.activeTags.push({ key: 'business', label: 'Business' });
    if (f.arts) this.activeTags.push({ key: 'arts', label: 'Arts' });
    if (f.cs) this.activeTags.push({ key: 'cs', label: 'Computer Science' });
    
    if (f.undergrad) this.activeTags.push({ key: 'undergrad', label: 'Undergraduate' });
    if (f.masters) this.activeTags.push({ key: 'masters', label: "Master's Degree" });
    if (f.phd) this.activeTags.push({ key: 'phd', label: 'PhD' });
    
    if (f.closingSoon) this.activeTags.push({ key: 'closingSoon', label: 'Closing Soon' });
    
    if (f.location && f.location !== 'Any Location') {
      this.activeTags.push({ key: 'location', label: f.location });
    }
  }

  removeTag(tag: FilterTag) {
    if (tag.key === 'location') {
      this.activeFilters.location = 'Any Location';
    } else {
      this.activeFilters[tag.key] = false;
    }
    // On recharge car supprimer un tag peut nécessiter un nouvel appel API (ex: location)
    this.applyFilters();
  }

  // --- PAGINATION ---
  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredScholarships.length / this.itemsPerPage);
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    
    if (this.currentPage > this.totalPages) this.currentPage = 1;
    if (this.totalPages === 0) this.currentPage = 1;
    
    this.updatePaginatedList();
  }

  updatePaginatedList() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedScholarships = this.filteredScholarships.slice(startIndex, endIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedList();
    }
  }

  // --- MAPPING (Identique à avant) ---
  private mapOpportunityToScholarship(op: Opportunity): Scholarship {
    const fullText = (op.title + ' ' + (op.description || '')).toLowerCase();
    const tags: string[] = [];

    // Détection de tags pour le filtrage client-side
    if (fullText.includes('engin') || fullText.includes('ingénieur') || fullText.includes('génie')) tags.push('Engineering');
    if (fullText.includes('med') || fullText.includes('health') || fullText.includes('sante') || fullText.includes('médecine')) tags.push('Medical');
    if (fullText.includes('busin') || fullText.includes('mba') || fullText.includes('gestion') || fullText.includes('management')) tags.push('Business');
    if (fullText.includes('art') || fullText.includes('design') || fullText.includes('culture') || fullText.includes('humanit')) tags.push('Arts');
    if (fullText.includes('computer') || fullText.includes('tech') || fullText.includes('ai') || 
        fullText.includes('informatique') || fullText.includes('web') || fullText.includes('data')) tags.push('CS');

    const safeValue = op.value || '';

    return {
      id: op.id as any, 
      title: op.title,
      description: op.description || '',
      image: op.imageUrl,
      category: (safeValue.toLowerCase().includes('full') || safeValue.toLowerCase().includes('complet')) ? 'Fully Funded' : 'Scholarship',
      badgeColor: (safeValue.toLowerCase().includes('full') || safeValue.toLowerCase().includes('complet')) ? 'success' : 'primary',
      level: op.level || 'Any Level',
      location: op.location,
      deadline: op.deadline || 'Open',
      amount: safeValue || 'N/A',
      tags: tags
    };
  }
}