import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { OpportunityService } from '../../services/opportunity'; 
import { Opportunity } from '../../models/opportunity';

import { DetailContentComponent } from '../../components/detail-content/detail-content';
import { DetailSidebarComponent } from '../../components/detail-sidebar/detail-sidebar';

@Component({
  selector: 'app-scholarship-details',
  standalone: true,
  imports: [CommonModule, RouterLink, DetailContentComponent, DetailSidebarComponent],
  templateUrl: './scholarship-details.html', 
  styleUrls: ['./scholarship-details.css']
})
export class ScholarshipDetailsComponent implements OnInit {
  
  opportunity?: Opportunity;
  
  // Listes pour l'affichage
  relatedOpportunities: Opportunity[] = []; 
  sidebarOpportunities: Opportunity[] = []; 
  
  // Textes dynamiques
  sectionTitle: string = 'Scholarships'; 
  listLink: string = '/scholarships';

  constructor(
    private route: ActivatedRoute,
    private opportunityService: OpportunityService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadData(id); 
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
      }
    });
  }

  
  handleImageError(event: any) {
    event.target.src = 'placeholder.jpg';
  }
 

  loadData(currentId: string): void {
    this.opportunityService.getOpportunities().subscribe({
      next: (allData) => {
        
        this.opportunity = allData.find(op => String(op.id) === currentId);

        if (this.opportunity) {
          
          if (this.opportunity.type === 'Training') {
            this.sectionTitle = 'Formations';
            this.listLink = '/trainings';
          } else if (this.opportunity.type === 'Event') {
            this.sectionTitle = 'Événements';
            this.listLink = '/events';
          } else {
            this.sectionTitle = 'Bourses';
            this.listLink = '/scholarships';
          }
          
          this.relatedOpportunities = allData.filter(item => 
              String(item.id) !== currentId && 
              item.type === this.opportunity!.type
          ).slice(0, 4);

          this.sidebarOpportunities = allData.filter(item => 
              String(item.id) !== currentId && 
              item.type !== this.opportunity!.type 
          ).slice(0, 5); 
          
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error("Erreur lors du chargement des détails :", err);
      }
    });
  }
}