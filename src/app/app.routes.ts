import { Routes } from '@angular/router';
import { DetailsPageComponent } from './pages/details-page/details-page';

export const routes: Routes = [
  { path: '', redirectTo: 'details/1', pathMatch: 'full' },
  
  // Route dynamique avec paramètre :id
  { path: 'details/:id', component: DetailsPageComponent },
  
  // Redirection si l'URL n'existe pas
  { path: '**', redirectTo: 'details/1' }
];