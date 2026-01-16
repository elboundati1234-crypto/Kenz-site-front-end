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

  // --- CHARGEMENT INTELLIGENT (API + FILTRES) ---
  loadData() {
    this.isLoading = true;

    const apiFilters: any = {};
    if (this.searchTerm) apiFilters.search = this.searchTerm;
    if (this.activeFilters.location && this.activeFilters.location !== 'Any Location') {
      apiFilters.pays = this.activeFilters.location;
    }
    if (this.activeFilters.phd) apiFilters.niveau = 'Doctorat';
    else if (this.activeFilters.masters) apiFilters.niveau = 'Master';
    else if (this.activeFilters.undergrad) apiFilters.niveau = 'Licence';
    if (this.activeFilters.closingSoon) apiFilters.closingSoon = true;

    this.opportunityService.getScholarships(apiFilters).subscribe({
      next: (data: Opportunity[]) => {
        this.allScholarships = data.map(op => this.mapOpportunityToScholarship(op));
        this.applyClientSideDomainFilters();
        this.isLoading = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error("Erreur chargement Bourses:", err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyClientSideDomainFilters() {
    const f = this.activeFilters;
    const hasFieldFilter = f.engineering || f.medical || f.business || f.arts || f.cs;

    if (!hasFieldFilter) {
      this.filteredScholarships = [...this.allScholarships];
    } else {
      this.filteredScholarships = this.allScholarships.filter(item => {
        const itemTags = item.tags ? item.tags.map(t => t.toLowerCase()) : [];
        let match = false;
        
        if (f.engineering && itemTags.includes('engineering')) match = true;
        if (f.medical && itemTags.includes('medical')) match = true;
        if (f.business && itemTags.includes('business')) match = true;
        if (f.arts && itemTags.includes('arts')) match = true;
        if (f.cs && (itemTags.includes('cs') || itemTags.includes('technology'))) match = true;
        
        return match;
      });
    }

    this.updateActiveTags();
    this.sortResults();      
    this.calculatePagination();
  }

  // --- GESTION DES ACTIONS UTILISATEUR ---

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

  // 👇 CORRECTION ICI POUR LE TRI 👇
  sortResults() {
    if (this.sortOption === 'newest') {
      // Tri alphabétique inverse sur l'ID (fonctionne pour les IDs MongoDB)
      this.filteredScholarships.sort((a, b) => String(b.id).localeCompare(String(a.id))); 
    } else if (this.sortOption === 'oldest') {
      // Tri alphabétique normal
      this.filteredScholarships.sort((a, b) => String(a.id).localeCompare(String(b.id)));
    }
  }
  // 👆 ---------------------------- 👆

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

  private mapOpportunityToScholarship(op: Opportunity): Scholarship {
    const tags = op.tags || [];
    const safeValue = op.value || '';
    const isFullyFunded = safeValue.toLowerCase().includes('full') || safeValue.toLowerCase().includes('complet');

    return {
      id: op.id as any, 
      title: op.title,
      description: op.description || '',
      image: op.imageUrl,
      category: isFullyFunded ? 'Fully Funded' : 'Scholarship',
      badgeColor: isFullyFunded ? 'success' : 'primary',
      level: op.level || 'Any Level',
      location: op.location,
      deadline: op.deadline || 'Open',
      amount: safeValue || 'N/A',
      tags: tags
    };
  }
}