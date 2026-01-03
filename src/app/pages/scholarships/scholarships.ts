import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OpportunityService } from '../../services/opportunity'; // Attention au chemin .service
import { Opportunity } from '../../models/opportunity';
import { Scholarship } from '../../models/scholarship';

import { ScholarshipCardComponent } from '../../components/scholarship-card/scholarship-card';
import { FilterSidebarComponent } from '../../components/filter-sidebar/filter-sidebar';

@Component({
  selector: 'app-scholarships',
  standalone: true,
  imports: [CommonModule, FormsModule, ScholarshipCardComponent, FilterSidebarComponent],
  templateUrl: './scholarships.html',
  styleUrls: ['./scholarships.css']
})
export class ScholarshipsComponent implements OnInit {

  allScholarships: Scholarship[] = [];     // Données brutes
  filteredScholarships: Scholarship[] = []; // Données filtrées (Totalité des résultats)
  paginatedScholarships: Scholarship[] = []; // Données affichées (6 par page)
  
  searchTerm: string = '';
  
  // Variables Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6; // Limite demandée
  totalPages: number = 0;
  pagesArray: number[] = [];

  activeFilters: any = {
    engineering: false, medical: false, business: false, arts: false, cs: false,
    undergrad: false, masters: false, phd: false, closingSoon: false, location: 'Any Location'
  };

  constructor(private opportunityService: OpportunityService) {}

  ngOnInit(): void {
    this.opportunityService.getOpportunities().subscribe((opportunities: Opportunity[]) => {
      this.allScholarships = opportunities
        .filter(op => op.type === 'Scholarship')
        .map(op => this.mapOpportunityToScholarship(op));
      
      // Initialisation
      this.filteredScholarships = [...this.allScholarships];
      this.calculatePagination(); // Calculer les pages au démarrage
    });
  }

  // --- GESTION PAGINATION ---
  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredScholarships.length / this.itemsPerPage);
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    
    // Si on filtre et que la page actuelle n'existe plus (ex: page 5 devient page 1)
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    
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

  // --- ÉVÉNEMENTS ---
  handleFilterChange(newFilters: any) {
    this.activeFilters = newFilters;
    this.applyFilters();
  }

  onSearch() {
    this.applyFilters();
  }

  handleReset() {
    this.searchTerm = '';
    this.activeFilters = { /* Reset manuel si nécessaire ou géré par l'enfant */ };
    this.applyFilters();
  }

  // --- FILTRAGE ---
  applyFilters() {
    this.filteredScholarships = this.allScholarships.filter(item => {
      
      // 1. Recherche Texte
      const term = this.searchTerm.toLowerCase();
      const matchesSearch = item.title.toLowerCase().includes(term) || item.description?.toLowerCase().includes(term);
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

      // 3. Filtres Level
      const hasLevelFilter = f.undergrad || f.masters || f.phd;
      if (hasLevelFilter) {
        const level = item.level.toLowerCase();
        let match = false;
        if (f.undergrad && (level.includes('undergrad') || level.includes('bachelor'))) match = true;
        if (f.masters && (level.includes("master") || (level.includes('graduate') && !level.includes('under')))) match = true;
        if (f.phd && (level.includes('phd') || level.includes('doctorate'))) match = true;
        if (!match) return false;
      }

      // 4. Closing Soon
      if (f.closingSoon) {
        const isSoon = item.deadline.includes('Oct') || item.deadline.includes('Nov') || item.deadline.includes('Dec');
        if (!isSoon) return false;
      }

      // 5. Location
      if (f.location && f.location !== 'Any Location' && !item.location.toLowerCase().includes(f.location.toLowerCase())) {
        return false;
      }

      return true;
    });

    // IMPORTANT : Après avoir filtré, on réinitialise la pagination à la page 1
    this.currentPage = 1;
    this.calculatePagination();
  }

  // --- MAPPING ---
  private mapOpportunityToScholarship(op: Opportunity): Scholarship {
    const fullText = (op.title + ' ' + op.description).toLowerCase();
    const tags: string[] = [];
    if (fullText.includes('engin')) tags.push('Engineering');
    if (fullText.includes('med') || fullText.includes('health')) tags.push('Medical');
    if (fullText.includes('busin') || fullText.includes('mba')) tags.push('Business');
    if (fullText.includes('art') || fullText.includes('humanit')) tags.push('Arts');
    if (fullText.includes('computer') || fullText.includes('tech') || fullText.includes('ai')) tags.push('CS');

    return {
      id: op.id,
      title: op.title,
      description: op.description,
      image: op.imageUrl,
      category: op.value.includes('Full') ? 'Fully Funded' : 'Scholarship',
      badgeColor: op.value.includes('Full') ? 'success' : 'primary',
      level: op.level || 'Any Level',
      location: op.location,
      deadline: op.deadline,
      amount: op.value,
      tags: tags
    };
  }
}