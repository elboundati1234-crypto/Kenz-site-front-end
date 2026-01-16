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
  
  // Ces filtres correspondent à ce que ScholarshipsComponent attend
  filters = {
    engineering: false,
    medical: false,
    business: false,
    arts: false,
    cs: false,
    
    undergrad: false, // Sera mappé vers 'Licence' par le parent
    masters: false,   // Sera mappé vers 'Master' par le parent
    phd: false,       // Sera mappé vers 'Doctorat' par le parent
    
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
    // Réinitialisation complète
    this.filters = {
      engineering: false, medical: false, business: false, arts: false, cs: false,
      undergrad: false, masters: false, phd: false, closingSoon: false, location: 'Any Location'
    };
    
    this.reset.emit(); // Signale au parent de faire ses propres resets (ex: search term)
    this.filterChange.emit(this.filters); // Envoie l'état vide pour recharger la liste API
  }
}