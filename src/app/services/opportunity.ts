import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Opportunity } from '../models/opportunity';

@Injectable({
  providedIn: 'root'
})
export class OpportunityService {

  // Vérifiez bien votre port (3000 ou 5001)
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
  // 2. MÉTHODES GÉNÉRALES (Legacy / Sidebar / Details)
  // =========================================================

  getOpportunities(): Observable<Opportunity[]> {
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
  // 3. MAPPING INTELLIGENT (Backend -> Frontend)
  // =========================================================
  private mapBackendToFrontend(data: any): Opportunity {
    
    // A. Traduction du TYPE
    const rawType = (data.opportuniteType || data.type || '').toLowerCase();
    let mappedType: 'Scholarship' | 'Training' | 'Event' = 'Scholarship';
    
    if (rawType.includes('bourse')) mappedType = 'Scholarship';
    else if (rawType.includes('formation')) mappedType = 'Training';
    else if (rawType.includes('evenement') || rawType.includes('événement')) mappedType = 'Event';

    // B. Génération des TAGS (Basé sur 'filiere' et 'titre')
    // C'est ce qui fait marcher les filtres Engineering, CS, etc.
    const tags: string[] = [];
    const textToCheck = (data.filiere + ' ' + data.titre + ' ' + (data.description || '')).toLowerCase();

    // -- CS / Tech --
    if (textToCheck.match(/informatique|computer|web|data|ai|intelligence|cyber|security|code|devops|robot|blockchain|vr|ar|machine|full stack|react|python|java/)) {
        tags.push('CS'); 
        tags.push('Technology');
    }
    // -- Engineering --
    if (textToCheck.match(/engineer|ingénieur|robot|civil|mech|electr/)) {
        tags.push('Engineering');
    }
    // -- Medical --
    if (textToCheck.match(/medic|health|santé|biol|pharma/)) {
        tags.push('Medical');
    }
    // -- Business --
    if (textToCheck.match(/business|management|gestion|market|finance|econ/)) {
        tags.push('Business');
    }
    // -- Arts --
    if (textToCheck.match(/art|design|culture|history|music|ux|ui|graphisme/)) {
        tags.push('Arts');
    }

    // C. Gestion des Dates
    const dateRef = data.dateLimite || data.dateDebut;
    const deadlineStr = dateRef ? new Date(dateRef).toLocaleDateString() : 'Open';

    // D. Gestion de la Valeur / Prix
    let displayValue = 'Paid';
    if (data.montant == 0 || data.montant == '0' || data.montant === 'Free' || data.statut_financier === 'free') {
        displayValue = 'Free';
    } else if (data.montant) {
        displayValue = isNaN(data.montant) ? data.montant : `€${data.montant}`;
    }

    // E. Image de secours
    // Si pas d'image, on met le placeholder
    const safeImage = (data.image && data.image.length > 5) ? data.image : 'placeholder.jpg';

    // F. Description enrichie avec la filière
    const fullDescription = (data.filiere ? `[${data.filiere}] ` : '') + (data.description || '');

    return {
      id: data._id || data.id, 
      title: data.titre,
      type: mappedType,
      
      organization: data.organisme || 'Unknown',
      orgDescription: data.orgDescription,
      
      location: data.pays || 'Online', 
      venue: data.lieu, 
      
      updatedAt: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Recently',
      imageUrl: safeImage,
      logoUrl: data.logo,
      
      description: fullDescription, 
      benefits: data.benefits,
      
      level: data.niveau_academique,
      eligibility: data.eligibility ? [data.eligibility] : [],
      
      deadline: deadlineStr,
      value: displayValue,
      
      duration: data.Duration || 'Variable',
      language: data.language,
      registrationLink: data.lienSource || data.lienOrganisation || '#',
      
      tags: tags // On passe les tags générés au composant
    };
  }

  private handleError(error: any): Observable<any[]> {
    console.error('Erreur Service Opportunité:', error);
    return of([]);
  }
}