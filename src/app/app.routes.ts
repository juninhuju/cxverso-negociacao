import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
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
        loadChildren: () =>
          import('./features/renegociacao/renegociacao.routes').then(
            (m) => m.RENEGOCIACAO_ROUTES,
          ),
      },
      {
        path: 'acompanhamento',
        loadChildren: () =>
          import('./features/acompanhamento/acompanhamento.routes').then(
            (m) => m.ACOMPANHAMENTO_ROUTES,
          ),
      },
      {
        path: 'chatbot',
        loadChildren: () =>
          import('./features/chatbot/chatbot.routes').then(
            (m) => m.CHATBOT_ROUTES,
          ),
      },
      {
        path: 'sobre',
        loadChildren: () =>
          import('./features/sobre/sobre.routes').then(
            (m) => m.SOBRE_ROUTES,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
