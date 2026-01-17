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
  allOpportunities: Opportunity[] = []; // Stocke TOUTES les données (Brutes)
  filteredOpportunities: Opportunity[] = []; // Stocke les données FILTRÉES (Affichées)
  
  // États
  isLoading: boolean = true;
  private routerSubscription: Subscription | undefined;

  // Filtres
  searchTerm: string = '';
  selectedLocation: string = ''; 
  selectedDate: string = '';     // 'thisWeek', 'nextMonth', ''
  selectedSort: string = 'Newest';

  constructor(
    private opportunityService: OpportunityService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
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

  handleImageError(event: any) {
    event.target.src = 'placeholder.jpg';
  }

  // --- CHARGEMENT VIA API ---
  loadData(): void {
    this.isLoading = true;

    // 1. On envoie Search et Location au serveur
    const apiFilters: any = {};

    if (this.searchTerm) apiFilters.search = this.searchTerm;

    if (this.selectedLocation) {
      if (this.selectedLocation === 'Online') apiFilters.pays = 'Online';
      else if (this.selectedLocation !== 'In Person') apiFilters.pays = this.selectedLocation;
    }

    // NOTE: On n'envoie PAS 'date' au serveur, on le gère localement pour que "This Week" fonctionne
    this.opportunityService.getEvents(apiFilters).subscribe({
      next: (data) => {
        this.allOpportunities = data;
        
        // 2. On applique les filtres de date et le tri localement
        this.applyLocalFilters();

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement Events:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- LOGIQUE DE FILTRAGE LOCAL (Pour This Week / Next Month) ---
  applyLocalFilters() {
    let temp = [...this.allOpportunities];

    // 1. FILTRE DATE
    if (this.selectedDate) {
        const now = new Date();
        // Pour éviter les problèmes d'heures, on met "maintenant" à 00:00:00
        now.setHours(0,0,0,0); 
        
        if (this.selectedDate === 'thisWeek') {
            const nextWeek = new Date(now);
            nextWeek.setDate(now.getDate() + 7);

            temp = temp.filter(op => {
                const opDate = this.getDateFromOpportunity(op);
                return opDate >= now && opDate <= nextWeek;
            });
        } 
        else if (this.selectedDate === 'nextMonth') {
            // Premier jour du mois prochain
            const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            // Dernier jour du mois prochain
            const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);

            temp = temp.filter(op => {
                const opDate = this.getDateFromOpportunity(op);
                return opDate >= nextMonthStart && opDate <= nextMonthEnd;
            });
        }
    }

    // 2. TRI (Basé sur la date de début)
    temp.sort((a, b) => { 
      const dateA = this.getDateFromOpportunity(a).getTime();
      const dateB = this.getDateFromOpportunity(b).getTime();
      
      if (this.selectedSort === 'Newest') {
        return dateB - dateA; // Le plus récent (futur) en premier
      } else {
        return dateA - dateB; // Le plus proche (bientôt) en premier
      }
    });

    this.filteredOpportunities = temp;
  }

  // Helper pour récupérer dateDebut proprement
  private getDateFromOpportunity(op: Opportunity): Date {
      // On utilise dateDebut, sinon deadline, sinon aujourd'hui (pour éviter le crash)
      const dateStr = op.dateDebut || op.deadline; 
      if (!dateStr) return new Date(0); // Date très ancienne par défaut
      return new Date(dateStr);
  }

  // --- ACTIONS UI ---

  applyFilters(): void {
    // Si on change la recherche, on recharge tout via l'API
    this.loadData();
  }

  setLocation(location: string) {
    this.selectedLocation = location;
    this.loadData();
  }

  setDate(dateFilter: string) {
    this.selectedDate = dateFilter;
    // Ici, PAS besoin de rappeler l'API, on filtre juste ce qu'on a déjà reçu
    this.applyLocalFilters(); 
  }

  setSort(sort: string) {
    this.selectedSort = sort;
    this.applyLocalFilters(); // Tri local uniquement
  }

  // --- HELPERS VISUELS ---

  isOnline(location: string): boolean {
    const loc = (location || '').toLowerCase();
    return loc.includes('online') || loc.includes('remote') || loc.includes('zoom') || loc.includes('webinar');
  }

  getBadgeClass(type: string): string {
    return 'bg-warning-subtle text-dark border-warning-subtle bg-opacity-75 backdrop-blur fw-bold';
  }
}