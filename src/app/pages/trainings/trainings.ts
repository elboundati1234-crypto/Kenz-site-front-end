import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OpportunityService } from '../../services/opportunity';
import { Opportunity } from '../../models/opportunity';
import { Training } from '../../models/training';

import { TrainingCardComponent } from '../../components/training-card/training-card';
import { TrainingFilterComponent } from '../../components/training-filter/training-filter';

// Interface pour les tags visuels
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
export class TrainingsComponent implements OnInit {
  
  allTrainings: Training[] = [];
  filteredTrainings: Training[] = [];
  paginatedTrainings: Training[] = [];

  searchTerm: string = '';

  // --- NOUVEAU : Variables pour Tri et Tags ---
  sortOption: string = 'newest';
  activeTags: FilterTag[] = [];
  activeFilters: any = {}; // Stocke l'état actuel des filtres
  // --------------------------------------------

  currentPage: number = 1;
  itemsPerPage: number = 6;
  totalPages: number = 0;
  pagesArray: number[] = [];

  constructor(private opportunityService: OpportunityService) {}

  ngOnInit(): void {
    this.opportunityService.getOpportunities().subscribe((data: Opportunity[]) => {
      const rawData = data.filter(op => op.type === 'Training');
      this.allTrainings = rawData.map(op => this.mapToTraining(op));
      
      this.filteredTrainings = [...this.allTrainings];
      
      // Tri initial
      this.sortResults();
      this.calculatePagination();
    });
  }

  // --- 1. GESTION DU TRI (SORT BY) ---
  onSortChange() {
    this.sortResults();
    this.currentPage = 1;
    this.calculatePagination();
  }

  sortResults() {
    if (this.sortOption === 'newest') {
      this.filteredTrainings.sort((a, b) => b.id - a.id);
    } else if (this.sortOption === 'oldest') {
      this.filteredTrainings.sort((a, b) => a.id - b.id);
    }
  }

  // --- 2. GESTION DES TAGS VISUELS ---
  updateActiveTags() {
    this.activeTags = [];
    const f = this.activeFilters;

    // Mapping manuel : Filtres -> Tags
    // Adaptez ces clés selon ce que votre <app-training-filter> envoie
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
    // Si c'est un bouton radio (Prix/Format), on remet à 'All' ou null
    if (tag.key === 'price' || tag.key === 'format') {
        this.activeFilters[tag.key] = 'All'; // ou null selon votre logique
    } else {
        // Si c'est une checkbox, on met false
        this.activeFilters[tag.key] = false;
    }
    
    // On réapplique les filtres
    this.applyFilters();
  }

  handleReset() {
    this.searchTerm = '';
    this.activeFilters = {}; // Reset total
    this.applyFilters();
  }

  // --- 3. LOGIQUE DE FILTRAGE PRINCIPALE ---
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
      const matchSearch = t.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // 2. Filtres Sidebar (Exemple)
      let matchPrice = true;
      if (f.price === 'Free' && t.badgeType !== 'Free') matchPrice = false;
      if (f.price === 'Paid' && t.badgeType === 'Free') matchPrice = false;

      let matchCategory = true;
      // Si au moins une catégorie est cochée, on vérifie. Sinon on affiche tout.
      const catChecked = f.development || f.design || f.business || f.data;
      if (catChecked) {
          matchCategory = false; // On part de false et on cherche une correspondance
          if (f.development && t.category === 'Development') matchCategory = true;
          if (f.design && t.category === 'Design') matchCategory = true;
          if (f.business && t.category === 'Business') matchCategory = true;
          if (f.data && t.category === 'Data Science') matchCategory = true;
      }

      return matchSearch && matchPrice && matchCategory;
    });

    // Mise à jour UI
    this.updateActiveTags();
    this.sortResults();
    
    // Reset Pagination
    this.currentPage = 1;
    this.calculatePagination();
  }


  // --- PAGINATION (Inchangé) ---
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

  // --- MAPPING (Inchangé) ---
  private mapToTraining(op: Opportunity): Training {
    const text = (op.title + ' ' + op.description).toLowerCase();
    let cat = 'General';
    if (text.includes('code') || text.includes('stack') || text.includes('web')) cat = 'Development';
    else if (text.includes('design') || text.includes('ux')) cat = 'Design';
    else if (text.includes('business') || text.includes('marketing')) cat = 'Business';
    else if (text.includes('data')) cat = 'Data Science';

    let badge: 'Featured' | 'Popular' | 'Free' | undefined = undefined;
    if (op.value?.toLowerCase().includes('free')) badge = 'Free';
    else if (op.tags?.includes('Featured')) badge = 'Featured';
    else if (op.tags?.includes('Popular')) badge = 'Popular';

    return {
      id: op.id,
      title: op.title,
      category: cat,
      organization: op.organization,
      image: op.imageUrl,
      duration: op.duration || 'Self-paced',
      description: op.description,
      badgeType: badge,
      isCertified: op.benefits?.toLowerCase().includes('certified') || false
    };
  }
}