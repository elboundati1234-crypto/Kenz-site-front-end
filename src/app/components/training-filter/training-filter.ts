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
  filters = {
    cs: false, business: false, design: false, health: false,
    live: true, selfPaced: false, inPerson: false,
    price: 'All'
  };

  @Output() filterChange = new EventEmitter<any>();

  onFilterChange() {
    this.filterChange.emit(this.filters);
  }

  resetFilters() {
    this.filters = { cs: false, business: false, design: false, health: false, live: true, selfPaced: false, inPerson: false, price: 'All' };
    this.onFilterChange();
  }
}