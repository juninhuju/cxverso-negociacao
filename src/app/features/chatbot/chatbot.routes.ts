import { Routes } from '@angular/router';

export const CHATBOT_ROUTES: Routes = [
  {
    path: '',
    data: {
      title: 'Chatbot de Apoio',
      description: 'Tire dúvidas sobre etapas da renegociação com o assistente de apoio.',
    },
    loadComponent: () =>
      import('./components/chatbot/chatbot.component').then((c) => c.ChatbotComponent),
  },
];
