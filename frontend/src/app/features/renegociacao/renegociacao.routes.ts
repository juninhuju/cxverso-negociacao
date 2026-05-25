import { Routes } from '@angular/router';

export const RENEGOCIACAO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/wizard/renegociacao-wizard.component').then(
        (c) => c.RenegociacaoWizardComponent,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'busca' },
      {
        path: 'busca',
        data: {
          title: 'Busca de Contrato',
          description: 'Pesquise contratos elegíveis para renegociação pelo documento do cliente.',
        },
        loadComponent: () =>
          import('./components/steps/busca-contrato/busca-contrato.component').then(
            (c) => c.BuscaContratoComponent,
          ),
      },
      {
        path: 'selecionar',
        data: {
          title: 'Seleção de Contrato',
          description: 'Selecione o contrato e os dados comerciais para continuar a renegociação.',
        },
        loadComponent: () =>
          import('./components/steps/selecionar-contrato/selecionar-contrato.component').then(
            (c) => c.SelecionarContratoComponent,
          ),
      },
      {
        path: 'validacao',
        data: {
          title: 'Validação Operacional',
          description: 'Confira regras operacionais e elegibilidade antes da simulação.',
        },
        loadComponent: () =>
          import('./components/steps/validacao-operacional/validacao-operacional.component').then(
            (c) => c.ValidacaoOperacionalComponent,
          ),
      },
      {
        path: 'juridico',
        data: {
          title: 'Consulta Jurídica',
          description: 'Avalie observações jurídicas relevantes para formalização da proposta.',
        },
        loadComponent: () =>
          import('./components/steps/consulta-juridica/consulta-juridica.component').then(
            (c) => c.ConsultaJuridicaComponent,
          ),
      },
      {
        path: 'simulacao',
        data: {
          title: 'Simulação',
          description: 'Simule condições de pagamento e cenário financeiro da renegociação.',
        },
        loadComponent: () =>
          import('./components/steps/simulacao/simulacao.component').then(
            (c) => c.SimulacaoComponent,
          ),
      },
      {
        path: 'confirmacao',
        data: {
          title: 'Confirmação da Renegociação',
          description: 'Confira todos os dados finais da simulação antes de formalizar.',
        },
        loadComponent: () =>
          import('./components/steps/confirmacao/confirmacaocomponent').then(
            (c) => c.ConfirmacaoComponent,
          ),
      },
      {
        path: 'conclusao',
        data: {
          title: 'Conclusão da Renegociação',
          description: 'Confirmação da formalização e próximos passos da renegociação.',
        },
        loadComponent: () =>
          import('./components/steps/conclusao/conclusao.component').then((c) => c.ConclusaoComponent),
      },
    ],
  },
];
