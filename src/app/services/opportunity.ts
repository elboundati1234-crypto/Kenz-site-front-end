import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Opportunity } from '../models/opportunity';

@Injectable({
  providedIn: 'root'
})
export class OpportunityService {

  // ATTENTION : Vérifiez votre port Backend (3000 ou 5001)
  // D'après votre demande d'API, c'était localhost:3000
  private baseUrl = 'http://localhost:5001/api'; 
  
  private http = inject(HttpClient);

  constructor() { }

  // =========================================================
  // 1. MÉTHODES DE FILTRAGE SPÉCIFIQUES (Côté Serveur)
  // =========================================================

  // GET /api/filters/bourses
  getScholarships(filters: any): Observable<Opportunity[]> {
    let params = new HttpParams();

    if (filters.search) params = params.set('search', filters.search);
    if (filters.pays && filters.pays !== 'Any Location') params = params.set('pays', filters.pays);
    if (filters.niveau) params = params.set('niveau', filters.niveau); // Ex: 'Master'
    if (filters.closingSoon) params = params.set('closingSoon', 'true');

    return this.http.get<any[]>(`${this.baseUrl}/filters/bourses`, { params }).pipe(
      map(data => data.map(item => this.mapBackendToFrontend(item))),
      catchError(err => this.handleError(err))
    );
  }

  // GET /api/filters/formations
  getTrainings(filters: any): Observable<Opportunity[]> {
    let params = new HttpParams();

    if (filters.search) params = params.set('search', filters.search);
    
    // Mapping Format: 'Online' -> 'online', 'In Person' -> 'inPerson'
    if (filters.format && filters.format !== 'All') {
      const fmt = filters.format === 'In Person' ? 'inPerson' : filters.format.toLowerCase();
      params = params.set('format', fmt);
    }
    
    // Mapping Price: 'Free' -> 'free', 'Paid' -> 'paid'
    if (filters.price && filters.price !== 'All') {
      params = params.set('price', filters.price.toLowerCase());
    }

    return this.http.get<any[]>(`${this.baseUrl}/filters/formations`, { params }).pipe(
      map(data => data.map(item => this.mapBackendToFrontend(item))),
      catchError(err => this.handleError(err))
    );
  }

  // GET /api/filters/evenements
  getEvents(filters: any): Observable<Opportunity[]> {
    let params = new HttpParams();

    if (filters.search) params = params.set('search', filters.search);
    if (filters.pays) params = params.set('pays', filters.pays);
    if (filters.date) params = params.set('date', filters.date); // 'thisWeek', 'nextMonth'

    return this.http.get<any[]>(`${this.baseUrl}/filters/evenements`, { params }).pipe(
      map(data => data.map(item => this.mapBackendToFrontend(item))),
      catchError(err => this.handleError(err))
    );
  }

  // GET /api/filters/search (Recherche Globale pour la Home)
  searchGlobal(titreKeyword: string): Observable<Opportunity[]> {
    const params = new HttpParams().set('titre', titreKeyword);
    return this.http.get<any[]>(`${this.baseUrl}/filters/search`, { params }).pipe(
      map(data => data.map(item => this.mapBackendToFrontend(item))),
      catchError(err => this.handleError(err))
    );
  }

  // =========================================================
  // 2. MÉTHODES GÉNÉRALES (Legacy / Sidebar)
  // =========================================================

  // Récupère tout (utilisé pour les pages de détails pour filtrer les related localement)
  getOpportunities(): Observable<Opportunity[]> {
    // Note: Utilise l'endpoint général ou une concaténation si pas d'endpoint "all"
    // Ici je suppose que /opportunites renvoie tout
    return this.http.get<any[]>(`${this.baseUrl}/opportunites`).pipe(
      map(data => {
        if (!data) return [];
        return data.map(item => this.mapBackendToFrontend(item));
      }),
      catchError(err => this.handleError(err))
    );
  }

  getOpportunityById(id: string | number): Observable<Opportunity | undefined> {
    return this.http.get<any>(`${this.baseUrl}/opportunites/${id}`).pipe(
      map(item => this.mapBackendToFrontend(item)),
      catchError(() => of(undefined))
    );
  }

  // =========================================================
  // 3. MAPPING (Backend FR -> Frontend EN)
  // =========================================================
  private mapBackendToFrontend(data: any): Opportunity {
    
    // A. Traduction du TYPE (opportuniteType -> type)
    let mappedType: 'Scholarship' | 'Training' | 'Event' = 'Scholarship';
    
    // On vérifie 'opportuniteType' (nouveau seed) ou 'type' (ancien seed)
    const rawType = (data.opportuniteType || data.type || '').toLowerCase();
    
    if (rawType.includes('bourse')) mappedType = 'Scholarship';
    else if (rawType.includes('formation')) mappedType = 'Training';
    else if (rawType.includes('evenement') || rawType.includes('événement')) mappedType = 'Event';

    // B. Gestion des Dates
    const dateRef = data.dateLimite || data.dateDebut;
    const deadlineStr = dateRef ? new Date(dateRef).toLocaleDateString() : 'Open';

    // C. Gestion de la Valeur / Prix
    let displayValue = 'Paid';
    if (data.montant == 0 || data.montant == '0' || data.montant === 'Free' || data.statut_financier === 'free') {
        displayValue = 'Free';
    } else if (data.montant) {
        displayValue = isNaN(data.montant) ? data.montant : `€${data.montant}`;
    }

    // D. Description enrichie
    const fullDescription = (data.filiere ? `[${data.filiere}] ` : '') + (data.description || '');

    return {
      id: data._id || data.id, 
      title: data.titre,
      type: mappedType, // On utilise bien 'type' côté frontend
      
      organization: data.organisme || 'Unknown',
      orgDescription: data.orgDescription,
      
      location: data.pays || 'Online', 
      venue: data.lieu, 
      
      updatedAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Recently',
      imageUrl: data.image || 'assets/placeholder.jpg',
      logoUrl: data.logo,
      
      description: fullDescription, 
      benefits: data.benefits,
      
      // Champs spécifiques
      level: data.niveau_academique, // Mappé depuis le backend
      eligibility: data.eligibility ? [data.eligibility] : [],
      
      deadline: deadlineStr,
      value: displayValue,
      
      duration: data.Duration || 'Variable',
      language: data.language,
      registrationLink: data.lienSource || data.lienOrganisation || '#'
    };
  }

  private handleError(error: any): Observable<any[]> {
    console.error('Erreur Service Opportunité:', error);
    return of([]);
  }
}