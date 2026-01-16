import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Opportunity } from '../models/opportunity';

@Injectable({
  providedIn: 'root'
})
export class OpportunityService {

  // Assurez-vous que le port est bon (5001 selon votre dernier message, ou 3000)
  private apiUrl = 'http://localhost:5001/api/opportunites'; 
  
  private http = inject(HttpClient);

  constructor() { }

  getOpportunities(): Observable<Opportunity[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(backendData => {
        if (!backendData) return [];
        return backendData.map(item => this.mapBackendToFrontend(item));
      }),
      catchError(error => {
        console.error('Erreur connexion Backend:', error);
        return of([]); 
      })
    );
  }

  getOpportunityById(id: string | number): Observable<Opportunity | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(item => this.mapBackendToFrontend(item)),
      catchError(() => of(undefined))
    );
  }

  // --- TRADUCTION BACKEND (FR) -> FRONTEND (EN) ---
  private mapBackendToFrontend(data: any): Opportunity {
    
    // 1. Traduction du TYPE
    let mappedType: any = 'Scholarship';
    // On normalise en minuscule pour éviter les erreurs de casse
    const rawType = (data.type || '').toLowerCase();
    
    if (rawType.includes('bourse')) mappedType = 'Scholarship';
    else if (rawType.includes('formation')) mappedType = 'Training';
    else if (rawType.includes('evenement') || rawType.includes('événement')) mappedType = 'Event';

    // 2. Gestion des Dates
    // Event utilise dateDebut, les autres dateLimite
    const dateRef = data.dateLimite || data.dateDebut;
    const deadlineStr = dateRef ? new Date(dateRef).toLocaleDateString() : 'Open';

    // 3. Gestion de la Valeur / Prix
    let displayValue = 'Paid';
    // Si montant est 0, "0", "Free" ou statut "free"
    if (data.montant == 0 || data.montant == '0' || data.montant === 'Free' || data.statut_financier === 'free') {
        displayValue = 'Free';
    } else if (data.montant) {
        displayValue = isNaN(data.montant) ? data.montant : `€${data.montant}`;
    }

    // 4. Enrichir la description avec la "Filière"
    // Important pour que la recherche "Informatique" fonctionne
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
      imageUrl: data.image || 'assets/placeholder.jpg',
      logoUrl: data.logo,
      
      description: fullDescription, 
      benefits: data.benefits,
      
      level: data.niveau_academique,
      eligibility: data.eligibility ? [data.eligibility] : [],
      
      deadline: deadlineStr,
      value: displayValue,
      
      duration: data.Duration || 'Variable', // Attention à la majuscule "Duration" dans votre backend
      language: data.language,
      registrationLink: data.lienSource || data.lienOrganisation || '#'
    };
  }
}