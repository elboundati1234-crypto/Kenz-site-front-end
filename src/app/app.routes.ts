import { Routes } from '@angular/router';

// Import des composants
import { ScholarshipsComponent } from './pages/scholarships/scholarships';
import { ScholarshipDetailsComponent } from './pages/scholarship-details/scholarship-details';
import { TrainingsComponent } from './pages/trainings/trainings'; // <--- NOUVEL IMPORT

export const routes: Routes = [
  // Page d'accueil (Redirige vers la liste des bourses par défaut)
  { path: '', redirectTo: 'scholarships', pathMatch: 'full' },
  
  // Page : Liste des Bourses (Existante)
  { path: 'scholarships', component: ScholarshipsComponent },
  
  // Page : Liste des Formations (NOUVELLE PAGE)
  { path: 'trainings', component: TrainingsComponent },
  
  // Page de détails dynamique (utilisée pour Bourses et Formations)
  { path: 'details/:id', component: ScholarshipDetailsComponent },
  
  // Redirection de sécurité (404)
  { path: '**', redirectTo: 'scholarships' }
];