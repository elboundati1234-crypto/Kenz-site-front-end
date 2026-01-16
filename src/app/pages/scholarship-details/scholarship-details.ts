import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

// Assurez-vous que les chemins sont corrects selon votre structure
import { OpportunityService } from '../../services/opportunity'; 
import { Opportunity } from '../../models/opportunity';

// Import des composants enfants (si vous les utilisez dans le HTML)
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
  relatedOpportunities: Opportunity[] = []; // Même type (Bas de page)
  sidebarOpportunities: Opportunity[] = []; // Types différents (Sidebar)
  
  // Textes dynamiques pour le fil d'ariane (breadcrumb)
  sectionTitle: string = 'Scholarships'; 
  listLink: string = '/scholarships';

  constructor(
    private route: ActivatedRoute,
    private opportunityService: OpportunityService,
    private cdr: ChangeDetectorRef // INDISPENSABLE : Pour forcer l'affichage immédiat
  ) {}

  ngOnInit(): void {
    // On s'abonne aux changements de l'URL (paramètre :id)
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      
      if (id) {
        this.loadData(id); 
        // Remonter en haut de page lors d'un changement de navigation
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
      }
    });
  }

  loadData(currentId: string): void {
    this.opportunityService.getOpportunities().subscribe({
      next: (allData) => {
        
        // 1. Trouver l'élément actuel
        // On convertit les ID en String pour comparer (sécurité MongoDB/Frontend)
        this.opportunity = allData.find(op => String(op.id) === currentId);

        if (this.opportunity) {
          
          // 2. Configuration des Textes et Liens selon le TYPE
          // On utilise bien la propriété 'type' ici
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

          // 3. Remplir la liste "Related" (Bas de page) -> MÊME TYPE
          this.relatedOpportunities = allData.filter(item => 
              String(item.id) !== currentId && 
              item.type === this.opportunity!.type
          ).slice(0, 4);

          // 4. Remplir la liste "Sidebar" (Côté droit) -> TYPES DIFFÉRENTS
          // Cela permet de suggérer des Événements si on regarde une Bourse, etc.
          this.sidebarOpportunities = allData.filter(item => 
              String(item.id) !== currentId && 
              item.type !== this.opportunity!.type 
          ).slice(0, 5); 
          
          // 5. Forcer la détection des changements
          // C'est ce qui règle le problème "il faut cliquer deux fois" ou "page blanche"
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error("Erreur lors du chargement des détails :", err);
      }
    });
  }
}