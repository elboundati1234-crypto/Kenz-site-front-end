import { Routes } from '@angular/router';
import { DetailsPageComponent } from './pages/details-page/details-page';

export const routes: Routes = [
  // Redirection par défaut vers l'ID 1 pour tester immédiatement
  { path: '', redirectTo: 'details/1', pathMatch: 'full' },
  
  // La route dynamique : on passe l'ID de l'offre dans l'URL
  { path: 'details/:id', component: DetailsPageComponent },

  // (Optionnel) Page 404 ou redirection si l'URL est mauvaise
  { path: '**', redirectTo: 'details/1' }
];