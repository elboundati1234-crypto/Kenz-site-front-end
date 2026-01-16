import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-training-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './training-filter.html', // Assurez-vous du nom correct
  styleUrls: ['./training-filter.css']
})
export class TrainingFilterComponent {
  
  // Ces clés correspondent exactement à ce que TrainingsComponent attend
  filters = {
    development: false, // Remplace 'cs'
    business: false,
    design: false,
    data: false,        // Remplace 'health' pour matcher Data Science
    
    format: 'All',      // Changé en string pour matcher l'API (Online/InPerson)
    price: 'All'
  };

  @Output() filterChange = new EventEmitter<any>();
  @Output() reset = new EventEmitter<void>(); // Ajout d'un event spécifique pour le reset

  onFilterChange() {
    this.filterChange.emit(this.filters);
  }

  resetFilters() {
    this.filters = { 
      development: false, 
      business: false, 
      design: false, 
      data: false, 
      format: 'All', 
      price: 'All' 
    };
    
    // On émet le changement pour recharger la liste
    this.filterChange.emit(this.filters);
    
    // On prévient le parent (optionnel, pour nettoyer la barre de recherche par ex)
    this.reset.emit();
  }
}