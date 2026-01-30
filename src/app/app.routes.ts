import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { RegisterComponent } from './pages/register/register';
import { LoginComponent } from './pages/login/login';
import { EventsComponent } from './pages/events/events';
import { ScholarshipsComponent } from './pages/scholarships/scholarships';
import { ScholarshipDetailsComponent } from './pages/scholarship-details/scholarship-details';
import { TrainingsComponent } from './pages/trainings/trainings';
import { Profiles } from './pages/profiles/profiles';
import { AboutComponent } from './pages/about/about';

export const routes: Routes = [
  // Home
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    component: HomeComponent,
    runGuardsAndResolvers: 'always'
  },

  // Auth
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile-user', component: Profiles },


  // Scholarships
  {
    path: 'scholarships',
    component: ScholarshipsComponent,
    runGuardsAndResolvers: 'always'
  },

  // Trainings
  {
    path: 'trainings',
    component: TrainingsComponent,
    runGuardsAndResolvers: 'always'
  },

  // Events
  {
    path: 'events',
    component: EventsComponent,
    runGuardsAndResolvers: 'always'
  },

  // Details 
  {
    path: 'details/:id',
    component: ScholarshipDetailsComponent,
    runGuardsAndResolvers: 'always'
  },
  
  {
    path: 'about',
    component: AboutComponent,
    runGuardsAndResolvers: 'always'
  },

  { path: '**', redirectTo: 'home' }
];