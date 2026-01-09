import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // AJOUT: ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

// Correction des imports (ajout de .service et .component)
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
  
  sectionTitle: string = 'ScholarHub'; 
  listLink: string = '/scholarships';

  constructor(
    private route: ActivatedRoute,
    private opportunityService: OpportunityService,
    private cdr: ChangeDetectorRef // AJOUT: Injection pour forcer l'affichage
  ) {}

  ngOnInit(): void {
    // paramMap détecte automatiquement si l'ID change dans l'URL (ex: passer de details/1 à details/2)
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      
      if (id) {
        this.loadData(id); 
        window.scrollTo(0, 0); 
      }
    });
  }

  loadData(currentId: string): void {
    this.opportunityService.getOpportunities().subscribe({
      next: (allData) => {
        
        // 1. Trouver l'élément (Comparaison String vs String pour sécurité)
        this.opportunity = allData.find(op => String(op.id) === currentId);

        if (this.opportunity) {
          
          // Configuration du Titre et Lien retour
          // Utilisation de type (nouvelle propriété)
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

          // --- LOGIQUE 1 : Bas de page (MÊME TYPE) ---
          this.relatedOpportunities = allData.filter(item => 
              String(item.id) !== currentId && // Exclure l'élément actuel
              item.type === this.opportunity!.type
          ).slice(0, 4);

          // --- LOGIQUE 2 : Sidebar (TYPES DIFFÉRENTS) ---
          this.sidebarOpportunities = allData.filter(item => 
              String(item.id) !== currentId && 
              item.type !== this.opportunity!.type 
          ).slice(0, 5); 
          
          // IMPORTANT : Force la mise à jour de l'interface
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error("Erreur chargement détails:", err);
      }
    });
  }
}