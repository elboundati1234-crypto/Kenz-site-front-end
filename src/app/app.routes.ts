import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { RegisterComponent } from './pages/register/register';
import { LoginComponent } from './pages/login/login';
import { EventsComponent } from './pages/events/events';
import { ScholarshipsComponent } from './pages/scholarships/scholarships';
import { ScholarshipDetailsComponent } from './pages/scholarship-details/scholarship-details';
import { TrainingsComponent } from './pages/trainings/trainings'; 

export const routes: Routes = [
  // Page d'accueil (Redirige vers la liste des bourses par défaut)
   { path: '', redirectTo: 'home', pathMatch: 'full' },
   { path: 'home', component: HomeComponent },
  
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Page : Liste des Bourses (Existante)
  { path: 'scholarships', component: ScholarshipsComponent },
  
  // Page : Liste des Formations (NOUVELLE PAGE)
  { path: 'trainings', component: TrainingsComponent },
  
  // Page : Liste des events (NOUVELLE PAGE)
  { path: 'events', component: EventsComponent },
  
  // Page de détails dynamique (utilisée pour Bourses et Formations)
  { path: 'details/:id', component: ScholarshipDetailsComponent },
  
  // Redirection de sécurité (404)
 { path: '**', redirectTo: 'home' }
];
