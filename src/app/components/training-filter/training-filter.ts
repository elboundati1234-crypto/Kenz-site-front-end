import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-training-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './training-filter.html', 
  styleUrls: ['./training-filter.css']
})
export class TrainingFilterComponent {
  
  // Ces filtres correspondent aux catégories "mappées" dans TrainingsComponent
  filters = {
    development: false, // Pour: Web Dev, Full Stack, DevOps, React...
    data: false,        // Pour: Machine Learning, Data Analysis...
    design: false,      // Pour: UX/UI Design...
    business: false,    // Pour: Marketing, Management...
    
    format: 'All',      // 'Online' ou 'In Person'
    price: 'All'        // 'Free' ou 'Paid'
  };

  @Output() filterChange = new EventEmitter<any>();
  @Output() reset = new EventEmitter<void>();

  onFilterChange() {
    this.filterChange.emit(this.filters);
  }

  resetFilters() {
    // Réinitialisation des valeurs
    this.filters = { 
      development: false, 
      business: false, 
      design: false, 
      data: false, 
      format: 'All', 
      price: 'All' 
    };
    
    // Notification au parent pour recharger la liste complète
    this.filterChange.emit(this.filters);
    
    // Notification spécifique pour reset (ex: vider la barre de recherche)
    this.reset.emit();
  }
}