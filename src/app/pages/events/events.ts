import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // AJOUT: ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { Opportunity } from '../../models/opportunity';
import { OpportunityService } from '../../services/opportunity'; // Assurez-vous du chemin .service

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './events.html',
  styleUrls: ['./events.css']
})
export class EventsComponent implements OnInit, OnDestroy {

  // Données
  opportunities: Opportunity[] = [];
  filteredOpportunities: Opportunity[] = [];
  
  // États de l'interface
  isLoading: boolean = true;
  private routerSubscription: Subscription | undefined;

  // Filtres
  searchTerm: string = '';
  selectedType: string = '';
  selectedLocation: string = '';
  selectedSort: string = 'Newest';

  constructor(
    private opportunityService: OpportunityService,
    private router: Router,
    private cdr: ChangeDetectorRef // AJOUT: Injection pour forcer la mise à jour
  ) {}

  ngOnInit(): void {
    // 1. Chargement initial
    this.loadData();

    // 2. Abonnement aux événements de navigation
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Recharger les données si on clique sur le lien alors qu'on est déjà sur la page
        this.loadData();
      }
    });
  }

  // Désinscription pour éviter les fuites de mémoire
  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // --- CHARGEMENT DES DONNÉES ---
  loadData(): void {
    this.isLoading = true;

    this.opportunityService.getOpportunities().subscribe({
      next: (data) => {
        // Filtre strict sur 'Event' en utilisant la nouvelle propriété type
        const eventsOnly = data.filter(op => op.type === 'Event');
        
        this.opportunities = eventsOnly;
        this.filteredOpportunities = eventsOnly;
        
        this.isLoading = false;
        this.applyFilters(); // Appliquer le tri par défaut
        
        // IMPORTANT : Force la mise à jour de la vue
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur de chargement des événements:', err);
        this.isLoading = false;
        this.cdr.detectChanges(); // On force la mise à jour même en cas d'erreur (pour arrêter le loader)
      }
    });
  }

  // --- FILTRAGE PRINCIPAL ---
  applyFilters(): void {
    let temp = [...this.opportunities]; // Copie pour ne pas modifier l'original

    // 1. Recherche Texte (Sécurisée)
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      temp = temp.filter(item =>
        item.title.toLowerCase().includes(term) ||
        (item.description || '').toLowerCase().includes(term) ||
        item.organization.toLowerCase().includes(term)
      );
    }

    // 2. Filtre Type
    if (this.selectedType) {
       // Logique future pour les sous-types
    }

    // 3. Filtre Location
    if (this.selectedLocation) {
      if (this.selectedLocation === 'Online') {
        temp = temp.filter(item => this.isOnline(item.location));
      } else if (this.selectedLocation === 'In Person') {
        temp = temp.filter(item => !this.isOnline(item.location));
      }
    }

    // 4. Tri (Sécurisé)
    if (this.selectedSort) {
      temp.sort((a, b) => { 
        const dateA = a.deadline ? new Date(a.deadline).getTime() : 0;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : 0;
        
        const validDateA = isNaN(dateA) ? 0 : dateA;
        const validDateB = isNaN(dateB) ? 0 : dateB;

        return this.selectedSort === 'Newest' ? validDateB - validDateA : validDateA - validDateB;
      });
    }

    this.filteredOpportunities = temp;
  }

  // --- HELPERS ---

  setType(type: string) {
    this.selectedType = type;
    this.applyFilters();
  }

  setLocation(location: string) {
    this.selectedLocation = location;
    this.applyFilters();
  }

  setSort(sort: string) {
    this.selectedSort = sort;
    this.applyFilters();
  }

  isOnline(location: string): boolean {
    const loc = (location || '').toLowerCase();
    return loc.includes('online') || loc.includes('remote') || loc.includes('zoom') || loc.includes('webinar');
  }

  getBadgeClass(type: string): string {
    return 'bg-primary-subtle text-primary border-primary-subtle bg-opacity-75 backdrop-blur fw-bold';
  }
}