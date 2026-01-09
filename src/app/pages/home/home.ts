import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // AJOUTS
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, Router, NavigationEnd } from '@angular/router'; // AJOUTS
import { Subscription } from 'rxjs'; // AJOUT
import { 
  LucideAngularModule, 
  Search, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  Grid, 
  GraduationCap, 
  BookOpen, 
  LayoutGrid 
} from 'lucide-angular';

import { Opportunity } from '../../models/opportunity';
import { OpportunityService } from '../../services/opportunity'; // Assurez-vous du .service

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  
  opportunities: Opportunity[] = [];
  private routerSubscription: Subscription | undefined; // Pour gérer la mémoire

  // Icons
  readonly SearchIcon = Search;
  readonly ArrowRightIcon = ArrowRight;
  readonly CalendarIcon = Calendar;
  readonly MapPinIcon = MapPin;
  readonly GridIcon = LayoutGrid;
  readonly ScholarshipIcon = GraduationCap;
  readonly TrainingIcon = BookOpen;

  constructor(
    private opportunityService: OpportunityService,
    private router: Router, // Injection Router
    private cdr: ChangeDetectorRef // Injection ChangeDetectorRef pour forcer l'affichage
  ) {}

  ngOnInit() {
    // 1. Chargement initial
    this.loadData();

    // 2. Écouter le rechargement (Si on clique sur Home alors qu'on y est déjà)
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.loadData(); // On recharge
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // --- CHARGEMENT DES DONNÉES ---
  loadData() {
    this.opportunityService.getOpportunities().subscribe({
      next: (data) => {
        // On prend seulement les 6 premières pour la page d'accueil
        this.opportunities = data.slice(0, 6);
        
        // IMPORTANT : Force la mise à jour de la vue si les données n'apparaissent pas
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur Home:", err);
      }
    });
  }

  // Helper pour les couleurs selon le type
  getCategoryTheme(type: string): { badge: string, btn: string, icon: string } {
    switch(type) {
      case 'Scholarship': 
        return { badge: 'bg-primary-subtle text-primary', btn: 'bg-primary-subtle text-primary', icon: 'text-primary' };
      case 'Training':
        return { badge: 'bg-success-subtle text-success', btn: 'bg-success-subtle text-success', icon: 'text-success' };
      case 'Event':
        return { badge: 'bg-warning-subtle text-dark', btn: 'bg-warning-subtle text-dark', icon: 'text-warning' };
      default:
        return { badge: 'bg-secondary-subtle text-secondary', btn: 'bg-light', icon: 'text-secondary' };
    }
  }

  // Helper traduction
  translateType(type: string): string {
    const map: { [key: string]: string } = {
      'Scholarship': 'Bourse',
      'Training': 'Formation',
      'Event': 'Événement'
    };
    return map[type] || type;
  }
}