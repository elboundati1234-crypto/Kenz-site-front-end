import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router'; // Import RouterLink pour le HTML
import { OpportunityService } from '../../services/opportunity';
import { Opportunity } from '../../models/opportunity';

@Component({
  selector: 'app-details-page',
  standalone: true,
  imports: [CommonModule, RouterLink], // RouterLink est essentiel pour les liens [routerLink]
  templateUrl: './details-page.html',
  styleUrls: ['./details-page.css']
})
export class DetailsPageComponent implements OnInit {
  
  opportunity: Opportunity | undefined;
  relatedOpportunities: Opportunity[] = [];
  activeTab: string = 'description';

  constructor(
    private route: ActivatedRoute,
    private opportunityService: OpportunityService
  ) {}

  ngOnInit(): void {
    // C'est ici que la magie opère.
    // On "s'abonne" aux changements de paramètres dans l'URL.
    // Si l'utilisateur clique sur une carte en bas (ex: ID 2), ce code se redéclenche.
    this.route.paramMap.subscribe(params => {
      const idString = params.get('id');
      
      if (idString) {
        const id = Number(idString);
        this.loadData(id);
        
        // Optionnel : Remonter en haut de page lors du changement de carte
        window.scrollTo(0, 0); 
      }
    });
  }

  loadData(currentId: number): void {
    // 1. Charger l'opportunité principale
    this.opportunityService.getOpportunityById(currentId).subscribe(data => {
      this.opportunity = data;
    });

    // 2. Charger les suggestions (More from ScholarHub)
    // On récupère tout, et on enlève l'élément qu'on est en train de regarder (filter)
    this.opportunityService.getOpportunities().subscribe(allData => {
      this.relatedOpportunities = allData.filter(item => item.id !== currentId);
    });
  }

  // Gestion des onglets (Description / Eligibility / Benefits)
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}