import { Routes } from '@angular/router';

export const ACOMPANHAMENTO_ROUTES: Routes = [
  {
    path: '',
    data: {
      title: 'Painel de Acompanhamento',
      description: 'Acompanhe solicitações e contratos em andamento no portal de renegociação.',
    },
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then((c) => c.DashboardComponent),
  },
  {
    path: 'contrato/:numero',
    data: {
      title: 'Detalhe do Contrato',
      description: 'Visualize o status e as ações disponíveis para o contrato selecionado.',
    },
    loadComponent: () =>
      import('./components/detalhe-contrato/detalhe-contrato.component').then((c) => c.DetalheContratoComponent),
  },
];
