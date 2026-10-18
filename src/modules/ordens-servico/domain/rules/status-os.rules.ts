import { BusinessException } from '../../../../shared/exceptions';
import { StatusOS } from '../enums/status-os.enum';

const transicoesPermitidas: Record<StatusOS, StatusOS[]> = {
  [StatusOS.RECEBIDA]: [StatusOS.EM_DIAGNOSTICO],
  [StatusOS.EM_DIAGNOSTICO]: [StatusOS.AGUARDANDO_APROVACAO],
  [StatusOS.AGUARDANDO_APROVACAO]: [StatusOS.EM_EXECUCAO],
  [StatusOS.EM_EXECUCAO]: [StatusOS.FINALIZADA],
  [StatusOS.FINALIZADA]: [StatusOS.ENTREGUE],
  [StatusOS.ENTREGUE]: [],
};

export class StatusOSRules {
  static validarTransicao(statusAtual: StatusOS, novoStatus: StatusOS): void {
    const permitidos = transicoesPermitidas[statusAtual];
    if (!permitidos || !permitidos.includes(novoStatus)) {
      throw new BusinessException(
        `Transição de status inválida: ${statusAtual} -> ${novoStatus}`,
      );
    }
  }

  static validarIniciarDiagnostico(statusAtual: StatusOS): void {
    if (statusAtual !== StatusOS.RECEBIDA) {
      throw new BusinessException(
        'Só é possível iniciar diagnóstico se a OS estiver RECEBIDA',
      );
    }
  }

  static validarGerarOrcamento(statusAtual: StatusOS): void {
    if (statusAtual !== StatusOS.EM_DIAGNOSTICO) {
      throw new BusinessException(
        'Só é possível gerar orçamento se a OS estiver EM_DIAGNOSTICO',
      );
    }
  }

  static validarAprovarOrcamento(statusAtual: StatusOS): void {
    if (statusAtual !== StatusOS.AGUARDANDO_APROVACAO) {
      throw new BusinessException(
        'Só é possível aprovar orçamento se a OS estiver AGUARDANDO_APROVACAO',
      );
    }
  }

  static validarIniciarExecucao(statusAtual: StatusOS): void {
    if (statusAtual !== StatusOS.AGUARDANDO_APROVACAO) {
      throw new BusinessException(
        'Só é possível iniciar execução se o orçamento estiver aprovado',
      );
    }
  }

  static validarFinalizar(statusAtual: StatusOS): void {
    if (statusAtual !== StatusOS.EM_EXECUCAO) {
      throw new BusinessException(
        'Só é possível finalizar a OS se ela estiver EM_EXECUCAO',
      );
    }
  }

  static validarEntrega(statusAtual: StatusOS): void {
    if (statusAtual !== StatusOS.FINALIZADA) {
      throw new BusinessException(
        'Só é possível entregar o veículo se a OS estiver FINALIZADA',
      );
    }
  }

  static validarRecusarOrcamento(statusAtual: StatusOS): void {
    if (statusAtual !== StatusOS.AGUARDANDO_APROVACAO) {
      throw new BusinessException(
        'Só é possível recusar orçamento se a OS estiver AGUARDANDO_APROVACAO',
      );
    }
  }
}
