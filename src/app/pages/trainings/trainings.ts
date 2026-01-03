import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router'; // Important pour les liens
import { OpportunityService } from '../../services/opportunity';
import { Opportunity } from '../../models/opportunity';
import { Training } from '../../models/training';

// Import des composants enfants
import { TrainingCardComponent } from '../../components/training-card/training-card';
import { TrainingFilterComponent } from '../../components/training-filter/training-filter';

@Component({
  selector: 'app-trainings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TrainingCardComponent, TrainingFilterComponent],
  templateUrl: './trainings.html',
  styleUrls: ['./trainings.css']
})
export class TrainingsComponent implements OnInit {
  
  // Données
  allTrainings: Training[] = [];      // Toutes les données chargées
  filteredTrainings: Training[] = []; // Données après filtres/recherche
  paginatedTrainings: Training[] = []; // Données affichées (page actuelle)

  searchTerm: string = '';

  // Variables Pagination
  currentPage: number = 1;
  itemsPerPage: number = 6; // Max 6 par page
  totalPages: number = 0;
  pagesArray: number[] = [];

  constructor(private opportunityService: OpportunityService) {}

  ngOnInit(): void {
    this.opportunityService.getOpportunities().subscribe((data: Opportunity[]) => {
      // 1. Filtrer pour ne garder que les 'Training'
      const rawData = data.filter(op => op.type === 'Training');
      
      // 2. Mapper vers le modèle Training
      this.allTrainings = rawData.map(op => this.mapToTraining(op));
      
      // 3. Initialiser la liste filtrée avec tout
      this.filteredTrainings = [...this.allTrainings];
      
      // 4. Calculer la première page
      this.calculatePagination();
    });
  }

  // --- LOGIQUE PAGINATION ---

  calculatePagination() {
    this.totalPages = Math.ceil(this.filteredTrainings.length / this.itemsPerPage);
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    
    // Si on est sur la page 5 mais qu'il n'y a plus que 2 pages après filtrage
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    
    // Cas spécial : si 0 résultats, page 1
    if (this.totalPages === 0) {
        this.currentPage = 1;
    }

    this.updatePaginatedList();
  }

  updatePaginatedList() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    this.paginatedTrainings = this.filteredTrainings.slice(startIndex, endIndex);
    
    // Remonter en haut de page lors du changement
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedList();
    }
  }

  // --- LOGIQUE FILTRES & RECHERCHE ---

  handleFilterChange(filters: any) {
    this.filteredTrainings = this.allTrainings.filter(t => {
      // Filtre Recherche Texte (gardé ici pour combiner)
      const matchSearch = t.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Filtre Prix
      let matchPrice = true;
      if (filters.price === 'Free') matchPrice = t.badgeType === 'Free';
      if (filters.price === 'Paid') matchPrice = t.badgeType !== 'Free';

      // Filtre Sujet (Exemple basique, à adapter selon vos checkbox)
      let matchSubject = true;
      if (filters.cs && t.category !== 'Development') matchSubject = false;
      // ... ajoutez d'autres logiques si besoin ...

      return matchSearch && matchPrice && matchSubject;
    });

    // IMPORTANT : Revenir page 1 après filtre
    this.currentPage = 1;
    this.calculatePagination();
  }

  onSearch() {
    // On rappelle la logique de filtre avec des filtres par défaut ou actuels
    // Pour faire simple ici, on refiltre sur le texte
    this.handleFilterChange({ price: 'All' }); // Ou gardez les filtres actuels en mémoire
  }

  // --- MAPPING ---
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
      description: op.description, // Important pour éviter l'erreur TS
      badgeType: badge,
      isCertified: op.benefits?.toLowerCase().includes('certified') || false
    };
  }
}