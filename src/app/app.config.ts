import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { authInterceptor } from './interceptors/auth-interceptor';

import {
  provideRouter,
  withComponentInputBinding,
  withRouterConfig,
  withViewTransitions
} from '@angular/router';
import { routes } from './app.routes';

import {
  provideHttpClient,
  withFetch,
  withInterceptors
} from '@angular/common/http';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';


// Register French locale
registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
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
