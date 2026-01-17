import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';

// 1. IMPORTS NÉCESSAIRES POUR LA DATE FR
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

// 2. ENREGISTREMENT DE LA LANGUE
registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
      withRouterConfig({ onSameUrlNavigation: 'reload' }) 
    ),
    provideHttpClient(withFetch()), // <-- J'ai ajouté la virgule ici qui manquait
    
    // 3. CONFIGURATION GLOBALE
    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ]
};