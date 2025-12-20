import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Opportunity } from '../../models/opportunity';
import { OpportunityService } from '../../services/opportunity';

@Component({
  selector: 'app-details-page',
  standalone: true,
  imports: [CommonModule], // Important pour *ngIf, *ngFor
  templateUrl: './details-page.html',
  styleUrls: ['./details-page.css']
})
export class DetailsPageComponent implements OnInit {
  opportunity: Opportunity | null = null;
  activeTab: string = 'description'; // Pour gérer les onglets (Description/Eligibility/Benefits)

  constructor(private opportunityService: OpportunityService) {}

  ngOnInit(): void {
    // On récupère les données au chargement
    this.opportunityService.getOpportunityById(1).subscribe(data => {
      this.opportunity = data;
    });
  }

  // Méthode pour changer d'onglet
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}