import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { authInterceptor } from './interceptors/auth-interceptor';

import {
  provideRouter,
  withComponentInputBinding,
  withRouterConfig,
  withViewTransitions,
  withInMemoryScrolling // 1. IMPORTER CECI
} from '@angular/router';
import { routes } from './app.routes';

import {
  provideHttpClient,
  withFetch,
  withInterceptors
} from '@angular/common/http';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      // 2. AJOUTER CE BLOC POUR LE SCROLL
      withInMemoryScrolling({
        scrollPositionRestoration: 'top', // Remonte en haut de page
        anchorScrolling: 'enabled',       // Active le scroll vers les ancres
      }),
      withComponentInputBinding(),
      withViewTransitions(),
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    ),

    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),

    { provide: LOCALE_ID, useValue: 'fr-FR' }
  ]
};