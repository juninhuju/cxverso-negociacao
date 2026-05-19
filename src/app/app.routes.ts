import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    data: {
      title: 'Acesso ao Portal',
      description: 'Acesse o portal Negocia.CAIXA para iniciar renegociações e acompanhar solicitações.',
    },
    loadComponent: () =>
      import('./features/login/login.component').then((c) => c.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/shell/shell.component').then((c) => c.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'renegociacao',
        data: {
          title: 'Renegociação',
          description: 'Fluxo de renegociação com busca, validação, simulação e formalização.',
        },
        loadChildren: () =>
          import('./features/renegociacao/renegociacao.routes').then(
            (m) => m.RENEGOCIACAO_ROUTES,
          ),
      },
      {
        path: 'acompanhamento',
        data: {
          title: 'Acompanhamento',
          description: 'Acompanhe contratos e solicitações de renegociação em andamento.',
        },
        loadChildren: () =>
          import('./features/acompanhamento/acompanhamento.routes').then(
            (m) => m.ACOMPANHAMENTO_ROUTES,
          ),
      },
      {
        path: 'chatbot',
        data: {
          title: 'Chatbot de Apoio',
          description: 'Canal de suporte para dúvidas sobre etapas e termos da renegociação.',
        },
        loadChildren: () =>
          import('./features/chatbot/chatbot.routes').then(
            (m) => m.CHATBOT_ROUTES,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
