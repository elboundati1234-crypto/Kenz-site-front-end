import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-sidebar.html'
})
export class FilterSidebarComponent {
  // État local des filtres
  filters = {
    engineering: false,
    medical: false,
    business: false,
    arts: false,
    cs: false,
    undergrad: false,
    masters: false,
    phd: false,
    closingSoon: false,
    location: 'Any Location'
  };

  // Événements vers le parent
  @Output() filterChange = new EventEmitter<any>();
  @Output() reset = new EventEmitter<void>();

  // Appelé à chaque clic sur une checkbox
  onFilterChange() {
    this.filterChange.emit(this.filters);
  }

  // Appelé par le lien "Reset"
  triggerReset() {
    this.filters = {
      engineering: false, medical: false, business: false, arts: false, cs: false,
      undergrad: false, masters: false, phd: false, closingSoon: false, location: 'Any Location'
    };
    this.reset.emit(); // Signale au parent de reset
    this.filterChange.emit(this.filters); // Envoie l'état vide
  }
}