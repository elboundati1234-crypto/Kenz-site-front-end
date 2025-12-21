export interface Opportunity {
  id: number;
  title: string;
  type: 'Scholarship' | 'Training' | 'Event'; // Pour gérer l'affichage conditionnel
  organization: string;
  location: string;
  updatedAt: string;
  imageUrl: string;
  logoUrl: string;
  description: string;
  eligibility: string[]; // Liste des conditions
  benefits: string;      // Champ spécifique demandé
  deadline: string;
  value: string;
  duration: string;
  language: string;
  registrationLink: string;
}