/**
 * Modelos para a feature de Renegociação
 *
 * ⚠️ REFATORAÇÃO: Os modelos `StatusContrato` e `Contrato` foram movidos para
 * `src/app/shared/models/contrato.model.ts` para evitar duplicação.
 *
 * Importe-os de lá ao invés desta pasta.
 */

export {
    ConsultaJuridica,
    Contrato,
    OpcaoSimulacao,
    Parcela,
    RenegociacaoSession,
    ResultadoRenegociacao,
    SimulacaoRenegociacao,
    SimulacoesDisponiveis,
    StatusContrato,
    StatusValidacao,
    ValidacaoOperacional
} from '../../../shared/models/contrato.model';
