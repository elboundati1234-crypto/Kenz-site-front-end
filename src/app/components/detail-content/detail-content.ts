import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Opportunity } from '../../models/opportunity';

@Component({
  selector: 'app-detail-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-content.html', 
  styleUrls: ['./detail-content.css']
})
export class DetailContentComponent {
  @Input() opportunity!: Opportunity;
  
  activeTab: string = 'description';

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  
  handleImageError(event: any) {
    event.target.src = 'placeholder.jpg';
  }
}