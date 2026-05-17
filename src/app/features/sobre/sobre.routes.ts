import { Routes } from '@angular/router';

export const SOBRE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./sobre.component').then((c) => c.SobreComponent),
  },
];
