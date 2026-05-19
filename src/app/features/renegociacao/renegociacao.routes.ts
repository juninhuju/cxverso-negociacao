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
        loadComponent: () =>
          import('./components/steps/busca-contrato/busca-contrato.component').then(
            (c) => c.BuscaContratoComponent,
          ),
      },
      {
        path: 'selecionar',
        loadComponent: () =>
          import('./components/steps/selecionar-contrato/selecionar-contrato.component').then(
            (c) => c.SelecionarContratoComponent,
          ),
      },
      {
        path: 'validacao',
        loadComponent: () =>
          import('./components/steps/validacao-operacional/validacao-operacional.component').then(
            (c) => c.ValidacaoOperacionalComponent,
          ),
      },
      {
        path: 'juridico',
        loadComponent: () =>
          import('./components/steps/consulta-juridica/consulta-juridica.component').then(
            (c) => c.ConsultaJuridicaComponent,
          ),
      },
      {
        path: 'simulacao',
        loadComponent: () =>
          import('./components/steps/simulacao/simulacao.component').then(
            (c) => c.SimulacaoComponent,
          ),
      },
      {
        path: 'resultado',
        loadComponent: () =>
          import('./components/steps/resultado/resultado.component').then(
            (c) => c.ResultadoComponent,
          ),
      },
      {
        path: 'conclusao',
        loadComponent: () =>
          import('./components/steps/conclusao/conclusao.component').then((c) => c.ConclusaoComponent),
      },
    ],
  },
];
