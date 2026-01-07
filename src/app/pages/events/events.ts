import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Opportunity } from '../../models/opportunity';
import { OpportunityService } from '../../services/opportunity';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './events.html',
  styleUrls: ['./events.css']
})
export class EventsComponent implements OnInit {

  opportunities: Opportunity[] = [];
  filteredOpportunities: Opportunity[] = [];

  // Filters state
  searchTerm: string = '';
  selectedType: string = '';
  selectedLocation: string = '';
  selectedSort: string = 'Newest';

  constructor(private opportunityService: OpportunityService) {}

  ngOnInit(): void {
    this.opportunityService.getOpportunities().subscribe(data => {
      // On ne garde que les Events comme demandé précédemment
      const eventsOnly = data.filter(op => op.type === 'Event');
      this.opportunities = eventsOnly;
      this.filteredOpportunities = eventsOnly;
    });
  }

  // Méthode principale de filtrage
  applyFilters(): void {
    let temp = this.opportunities;

    // 1. Search
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      temp = temp.filter(item =>
        item.title.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        item.organization.toLowerCase().includes(term)
      );
    }

    // 2. Type
    if (this.selectedType) {
      // Note: Assure-toi que tes données ont des types qui correspondent (Workshop, Seminar, etc.)
      // Sinon, adapte les valeurs dans le HTML
      // temp = temp.filter(item => item.tags?.includes(this.selectedType)); 
      // Pour l'instant on filtre sur rien car tes données n'ont pas de sous-type "Seminar", 
      // mais la logique est là.
    }

    // 3. Location
    if (this.selectedLocation) {
      if (this.selectedLocation === 'Online') {
        temp = temp.filter(item => this.isOnline(item.location));
      } else if (this.selectedLocation === 'In Person') {
        temp = temp.filter(item => !this.isOnline(item.location));
      }
    }

    // 4. Sort
    if (this.selectedSort) {
      temp = [...temp].sort((a, b) => { 
        const dateA = new Date(a.deadline).getTime();
        const dateB = new Date(b.deadline).getTime();
        return this.selectedSort === 'Newest' ? dateB - dateA : dateA - dateB;
      });
    }

    this.filteredOpportunities = temp;
  }

  // Helpers pour les dropdowns Bootstrap
  setType(type: string) {
    this.selectedType = type;
    this.applyFilters();
  }

  setLocation(location: string) {
    this.selectedLocation = location;
    this.applyFilters();
  }

  setSort(sort: string) {
    this.selectedSort = sort;
    this.applyFilters();
  }

  isOnline(location: string): boolean {
    return location.toLowerCase().includes('online') || location.toLowerCase().includes('remote');
  }

  // Helper pour les couleurs de badges selon le design
  getBadgeClass(type: string): string {
    // Tu peux adapter cette logique selon tes types réels
    if (type === 'Training' || type === 'Workshop') return 'bg-success-subtle text-success border-success-subtle';
    if (type === 'Event' || type === 'Conference') return 'bg-primary-subtle text-primary border-primary-subtle bg-opacity-75 backdrop-blur';
    return 'bg-warning-subtle text-warning-emphasis border-warning-subtle';
  }
}