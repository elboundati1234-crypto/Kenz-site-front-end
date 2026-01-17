import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { Opportunity } from '../../models/opportunity';
import { OpportunityService } from '../../services/opportunity';

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
  filteredOpportunities: Opportunity[] = []; // Liste affichée
  
  // États
  isLoading: boolean = true;
  private routerSubscription: Subscription | undefined;

  // Filtres
  searchTerm: string = '';
  selectedLocation: string = ''; // Correspond à 'pays' dans l'API
  selectedDate: string = '';     // Correspond à 'date' dans l'API (ex: 'thisWeek')
  selectedSort: string = 'Newest';

  // Variable inutilisée pour l'API Events mais gardée pour la structure
  selectedType: string = ''; 

  constructor(
    private opportunityService: OpportunityService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 1. Chargement initial
    this.loadData();

    // 2. Gestion du rechargement (Navigation)
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.loadData();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
// --- GESTION DES IMAGES CASSÉES ---
  handleImageError(event: any) {
    // Utilise l'image placeholder.jpg située dans votre dossier public
    event.target.src = 'placeholder.jpg';
  }
  // --- CHARGEMENT VIA API ---
  loadData(): void {
    this.isLoading = true;

    // 1. Préparation des filtres pour l'API
    const apiFilters: any = {};

    // A. Recherche
    if (this.searchTerm) {
      apiFilters.search = this.searchTerm;
    }

    // B. Location (Pays)
    // Note : L'API attend un pays. Si 'Online', on l'envoie comme pays.
    if (this.selectedLocation) {
      if (this.selectedLocation === 'Online') {
        apiFilters.pays = 'Online';
      } else if (this.selectedLocation !== 'In Person') {
        // Si c'est un pays spécifique (ex: Morocco) et pas juste "In Person"
        apiFilters.pays = this.selectedLocation;
      }
      // Si c'est juste "In Person" (sans pays), on n'envoie pas de filtre pays 
      // pour récupérer tous les événements physiques.
    }

    // C. Date (thisWeek, nextMonth)
    if (this.selectedDate) {
      apiFilters.date = this.selectedDate;
    }

    // 2. Appel au Service (qui appelle /api/filters/evenements)
    this.opportunityService.getEvents(apiFilters).subscribe({
      next: (data) => {
        // Le Backend renvoie déjà uniquement les 'Events' filtrés
        this.opportunities = data;
        this.filteredOpportunities = data;
        
        // 3. Tri Client-side (si l'API ne gère pas le sort)
        this.sortResults();

        this.isLoading = false;
        this.cdr.detectChanges(); // Force l'affichage
      },
      error: (err) => {
        console.error('Erreur chargement Events:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- GESTION DES FILTRES ---
  
  // Appelé quand l'utilisateur change un filtre ou tape dans la recherche
  applyFilters(): void {
    // On délègue tout au Backend via loadData
    this.loadData();
  }

  // --- HELPERS POUR L'UI ---

  setLocation(location: string) {
    this.selectedLocation = location;
    this.applyFilters();
  }

  // Nouvelle méthode pour le filtre de date
  setDate(dateFilter: string) {
    // Valeurs attendues par l'API: 'thisWeek', 'nextMonth', ou ''
    this.selectedDate = dateFilter;
    this.applyFilters();
  }

  setSort(sort: string) {
    this.selectedSort = sort;
    // Le tri est fait localement après réception des données
    this.sortResults(); 
  }

  // Tri local (Client-Side)
  sortResults() {
    // On trie sur filteredOpportunities pour mise à jour immédiate
    this.filteredOpportunities.sort((a, b) => { 
      const dateA = a.deadline ? new Date(a.deadline).getTime() : 0;
      const dateB = b.deadline ? new Date(b.deadline).getTime() : 0;
      
      const validDateA = isNaN(dateA) ? 0 : dateA;
      const validDateB = isNaN(dateB) ? 0 : dateB;

      if (this.selectedSort === 'Newest') {
        return validDateB - validDateA;
      } else {
        return validDateA - validDateB;
      }
    });
  }

  // Helper visuel pour savoir si c'est en ligne (pour l'icône)
  isOnline(location: string): boolean {
    const loc = (location || '').toLowerCase();
    return loc.includes('online') || loc.includes('remote') || loc.includes('zoom') || loc.includes('webinar');
  }

  getBadgeClass(type: string): string {
    return 'bg-warning-subtle text-dark border-warning-subtle bg-opacity-75 backdrop-blur fw-bold';
  }
}