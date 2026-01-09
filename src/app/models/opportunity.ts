export interface Opportunity {
  // MongoDB renvoie un string pour l'ID (ex: "6598a...")
  id: string | number; 
  
  title: string;
  opportuniteType: 'Scholarship' | 'Training' | 'Event' ;
  
  organization: string;
  orgDescription?: string;
  
  location: string;       // Mappé depuis 'pays' ou 'location'
  venue?: string;         // Mappé depuis 'lieu' (Backend Event)
  
  updatedAt?: string;     // Mappé depuis 'createdAt' ou 'updatedAt'
  imageUrl: string;       // Mappé depuis 'image'
  logoUrl?: string;       // Mappé depuis 'logo'
  
  description: string;
  benefits?: string;
  
  // Champs spécifiques
  level?: string;         // Mappé depuis 'niveau_academique'
  eligibility?: string[]; // Mappé depuis 'eligibility' (string) -> array
  
  deadline?: string;      // Mappé depuis 'dateLimite' ou 'dateDebut'
  value?: string;         // Mappé depuis 'montant' (avec ajout de devise)
  duration?: string;      // Mappé depuis 'duree' ou calculé
  language?: string;
  
  registrationLink?: string; // Mappé depuis 'lienSource'
  tags?: string[];
}