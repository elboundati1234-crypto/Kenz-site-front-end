import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs'; // AJOUT: forkJoin
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
import { OpportunityService } from '../../services/opportunity';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  
  opportunities: Opportunity[] = [];
  private routerSubscription: Subscription | undefined;

  // États
  searchTerm: string = '';
  activeCategory: 'All' | 'Scholarship' | 'Training' | 'Event' = 'All';
  isLoading: boolean = true;

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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.searchTerm = '';
        this.activeCategory = 'All';
        this.loadData();
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // --- LOGIQUE DE CHARGEMENT ---
  loadData() {
    this.isLoading = true;
    this.opportunities = []; 

    // 1. RECHERCHE (Prioritaire)
    if (this.searchTerm.trim()) {
      this.opportunityService.searchGlobal(this.searchTerm).subscribe({
        next: (data) => {
          this.opportunities = data.slice(0, 6); // Max 6 résultats de recherche
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => this.handleError(err)
      });
      return; // On arrête ici si recherche
    } 

    // 2. FILTRES PAR CATÉGORIE
    switch (this.activeCategory) {
      
      case 'Scholarship':
        this.opportunityService.getScholarships({}).subscribe({
          next: (data) => this.handleSimpleResponse(data),
          error: (err) => this.handleError(err)
        });
        break;

      case 'Training':
        this.opportunityService.getTrainings({}).subscribe({
          next: (data) => this.handleSimpleResponse(data),
          error: (err) => this.handleError(err)
        });
        break;

      case 'Event':
        this.opportunityService.getEvents({}).subscribe({
          next: (data) => this.handleSimpleResponse(data),
          error: (err) => this.handleError(err)
        });
        break;

      // CAS "TOUT VOIR" : MIX 2 + 2 + 2
      case 'All':
      default:
        // On lance les 3 requêtes en parallèle
        forkJoin({
          scholarships: this.opportunityService.getScholarships({}),
          trainings: this.opportunityService.getTrainings({}),
          events: this.opportunityService.getEvents({})
        }).subscribe({
          next: (results) => {
            // On prend les 2 premiers de chaque tableau
            const topScholarships = results.scholarships.slice(0, 2);
            const topTrainings = results.trainings.slice(0, 2);
            const topEvents = results.events.slice(0, 2);

            // On combine le tout (Total = 6 items max)
            this.opportunities = [
              ...topScholarships, 
              ...topTrainings, 
              ...topEvents
            ];

            // Optionnel: Trier par date (newest) pour mélanger un peu l'affichage
            // this.opportunities.sort((a, b) => Number(b.id) - Number(a.id));

            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (err) => this.handleError(err)
        });
        break;
    }
  }

  // Helper pour les cas simples (une seule catégorie)
  private handleSimpleResponse(data: Opportunity[]) {
    this.opportunities = data.slice(0, 6);
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private handleError(err: any) {
    console.error("Erreur Home:", err);
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  // --- ACTIONS ---
  onSearch() {
    this.activeCategory = 'All';
    this.loadData();
  }

  setCategory(category: 'All' | 'Scholarship' | 'Training' | 'Event') {
    this.activeCategory = category;
    this.searchTerm = ''; 
    this.loadData();
  }

  // --- HELPERS VISUELS ---
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

  translateType(type: string): string {
    const map: { [key: string]: string } = {
      'Scholarship': 'Bourse',
      'Training': 'Formation',
      'Event': 'Événement'
    };
    return map[type] || type;
  }
}