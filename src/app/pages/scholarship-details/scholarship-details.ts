import { Component, OnInit } from '@angular/core';
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
  
  // LISTE 1 : Pour le bas de page (Même type)
  relatedOpportunities: Opportunity[] = []; 

  // LISTE 2 : Pour la Sidebar (Types différents : Event, Scholarship...)
  sidebarOpportunities: Opportunity[] = []; 
  
  sectionTitle: string = 'ScholarHub'; 
  listLink: string = '/scholarships';

  constructor(
    private route: ActivatedRoute,
    private opportunityService: OpportunityService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idString = params.get('id');
      if (idString) {
        const id = Number(idString);
        this.loadData(id);
        window.scrollTo(0, 0); 
      }
    });
  }

  loadData(currentId: number): void {
    this.opportunityService.getOpportunities().subscribe(allData => {
      
      this.opportunity = allData.find(op => op.id === currentId);

      if (this.opportunity) {
        
        // Configuration Titre (Bas de page)
        if (this.opportunity.type === 'Training') {
          this.sectionTitle = 'Trainings';
          this.listLink = '/trainings';
        } else if (this.opportunity.type === 'Event') {
          this.sectionTitle = 'Events';
          this.listLink = '/events';
        } else {
          this.sectionTitle = 'Scholarships';
          this.listLink = '/scholarships';
        }

        // ---------------------------------------------------------
        // LOGIQUE 1 : Bas de page (MÊME TYPE) - "More from Trainings"
        // ---------------------------------------------------------
        this.relatedOpportunities = allData.filter(item => 
            item.id !== currentId && 
            item.type === this.opportunity!.type
        ).slice(0, 4);

        // ---------------------------------------------------------
        // LOGIQUE 2 : Sidebar (TYPES DIFFÉRENTS) - "Similar Opportunities"
        // ---------------------------------------------------------
        this.sidebarOpportunities = allData.filter(item => 
            item.id !== currentId && 
            item.type !== this.opportunity!.type // <--- NOTEZ LE !== (DIFFÉRENT)
        ).slice(0, 5); // On en prend 5 au hasard parmi les autres types
      }
    });
  }
}