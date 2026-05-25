  import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { RouterOutlet } from '@angular/router';
import { RenegociacaoFacade } from '../../../../states/renegociacao/renegociacao.facade';

  const STEPS = [
    { label: 'Contrato', path: 'selecionar' },
    { label: 'Validação', path: 'validacao' },
    { label: 'Simulação', path: 'simulacao' },
    { label: 'Confirmação', path: 'confirmacao' },
    { label: 'Conclusão', path: 'conclusao' },
  ] as const;

  @Component({
    selector: 'app-renegociacao-wizard',
    standalone: true,
    imports: [RouterOutlet, MatStepperModule, MatProgressBarModule, MatCardModule],
    templateUrl: './renegociacao-wizard.component.html',
    styleUrl: './renegociacao-wizard.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  export class RenegociacaoWizardComponent {
    private readonly facade = inject(RenegociacaoFacade);

    readonly steps = STEPS;
    readonly stepAtual = this.facade.stepAtual;
    readonly loading = this.facade.loading;

    get progressPercent(): number {
      const stepAtual = Math.max(0, this.stepAtual() ?? 0);
      // Se estiver no último step (Conclusão), mostrar 100%
      if (stepAtual >= STEPS.length - 1) {
        return 100;
      }
      return Math.round((stepAtual / (STEPS.length - 1)) * 100);
    }

    /**
     * Verifica se o contrato está apto para renegociação.
     * Retorna false se o status for 'CEDIDO', true para os demais.
     */
    isContratoApto(status: string): boolean {
      return this.facade.validarContratoElegibilidade(status);
    }
  }
