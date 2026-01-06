import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search, Filter, Calendar, MapPin, Globe } from 'lucide-angular';
import { MockDataService, Opportunity } from '../../services/mock-data';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './events.html',
  styleUrls: ['./events.css']
})
export class EventsComponent implements OnInit {
  opportunities: Opportunity[] = [];
  filteredOpportunities: Opportunity[] = [];

  // Filters
  searchTerm: string = '';
  selectedType: string = '';

  // Icons
  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;
  readonly CalendarIcon = Calendar;
  readonly MapPinIcon = MapPin;
  readonly GlobeIcon = Globe;

  constructor(private dataService: MockDataService) {}

  ngOnInit() {
    this.dataService.getOpportunities().subscribe(data => {
      this.opportunities = data;
      this.filteredOpportunities = data;
    });
  }

  applyFilters() {
    this.filteredOpportunities = this.opportunities.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesType = this.selectedType ? item.category === this.selectedType : true;

      return matchesSearch && matchesType;
    });
  }
}
