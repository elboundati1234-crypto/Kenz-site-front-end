import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // AJOUT: ChangeDetectorRef
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

  allScholarships: Scholarship[] = [];
  filteredScholarships: Scholarship[] = [];
  paginatedScholarships: Scholarship[] = [];
  
  searchTerm: string = '';
  isLoading: boolean = true; // AJOUT: Pour gérer l'affichage
  
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
    private cdr: ChangeDetectorRef // AJOUT: Injection pour forcer la mise à jour
  ) {}

  ngOnInit(): void {
    console.log("ScholarshipsComponent: Init");
    
    // 1. Chargement initial immédiat
    this.loadData();

    // 2. Écoute du rechargement (si clic sur le header alors qu'on est déjà là)
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        console.log("ScholarshipsComponent: NavigationEnd detecté -> Reloading data");
        this.loadData();
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
      next: (opportunities: Opportunity[]) => {
        console.log("Données reçues du service:", opportunities.length);

        // Filtrage sécurisé
        const rawData = opportunities.filter(op => op.opportuniteType === 'Scholarship');
        console.log("Bourses filtrées (Scholarship):", rawData.length);

        // Mapping
        this.allScholarships = rawData.map(op => this.mapOpportunityToScholarship(op));
        
        // Initialisation de la liste affichée
        this.filteredScholarships = [...this.allScholarships];
        
        // Appliquer filtres et tri initiaux
        this.applyFilters(); 
        
        this.isLoading = false;

        // FORCE LA MISE À JOUR DE LA VUE (Solution au problème d'affichage)
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("Erreur chargement bourses:", err);
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
    this.applyFilters();
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
    // Réinitialiser les filtres si nécessaire
    this.activeFilters.location = 'Any Location';
    this.activeFilters.engineering = false; // etc...
    this.applyFilters();
  }

  applyFilters() {
    this.filteredScholarships = this.allScholarships.filter(item => {
      // 1. Recherche Texte
      const term = this.searchTerm.toLowerCase();
      const matchesSearch = item.title.toLowerCase().includes(term) || (item.description || '').toLowerCase().includes(term);
      if (!matchesSearch) return false;

      // 2. Filtres Sidebar
      const f = this.activeFilters;
      const itemTags = item.tags ? item.tags.map(t => t.toLowerCase()) : [];
      
      const hasFieldFilter = f.engineering || f.medical || f.business || f.arts || f.cs;
      if (hasFieldFilter) {
        let match = false;
        if (f.engineering && itemTags.includes('engineering')) match = true;
        if (f.medical && itemTags.includes('medical')) match = true;
        if (f.business && itemTags.includes('business')) match = true;
        if (f.arts && itemTags.includes('arts')) match = true;
        if (f.cs && itemTags.includes('cs')) match = true;
        if (!match) return false;
      }

      // 3. Level
      const hasLevelFilter = f.undergrad || f.masters || f.phd;
      const level = (item.level || '').toLowerCase();
      if (hasLevelFilter) {
        let match = false;
        if (f.undergrad && (level.includes('undergrad') || level.includes('bachelor') || level.includes('licence'))) match = true;
        if (f.masters && (level.includes("master") || (level.includes('graduate') && !level.includes('under')))) match = true;
        if (f.phd && (level.includes('phd') || level.includes('doctorate') || level.includes('doctorat'))) match = true;
        if (!match) return false;
      }

      // 4. Closing Soon
      const deadline = item.deadline || '';
      if (f.closingSoon) {
        const isSoon = deadline.includes('Oct') || deadline.includes('Nov') || deadline.includes('Dec');
        if (!isSoon) return false;
      }

      // 5. Location
      const loc = (item.location || '').toLowerCase();
      if (f.location && f.location !== 'Any Location' && !loc.includes(f.location.toLowerCase())) {
        return false;
      }

      return true;
    });

    this.updateActiveTags();
    this.sortResults();
    this.currentPage = 1;
    this.calculatePagination();
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

  // --- MAPPING ---
  private mapOpportunityToScholarship(op: Opportunity): Scholarship {
    const fullText = (op.title + ' ' + (op.description || '')).toLowerCase();
    const tags: string[] = [];

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