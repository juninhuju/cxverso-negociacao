import { Routes } from '@angular/router';

export const CHATBOT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/chatbot/chatbot.component').then((c) => c.ChatbotComponent),
  },
];
