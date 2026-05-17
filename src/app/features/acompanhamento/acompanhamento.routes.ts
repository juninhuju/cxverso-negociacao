import { Routes } from '@angular/router';

export const ACOMPANHAMENTO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then((c) => c.DashboardComponent),
  },
  {
    path: 'contrato/:numero',
    loadComponent: () =>
      import('./components/detalhe-contrato/detalhe-contrato.component').then((c) => c.DetalheContratoComponent),
  },
];
