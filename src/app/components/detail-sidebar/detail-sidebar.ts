import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Opportunity } from '../../models/opportunity';

@Component({
  selector: 'app-detail-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detail-sidebar.html',
  styleUrls: ['./detail-sidebar.css']
})
export class DetailSidebarComponent {
  @Input() opportunity!: Opportunity;
  @Input() relatedOpportunities: Opportunity[] = []; // Reçoit la liste pour l'affichage sidebar
}