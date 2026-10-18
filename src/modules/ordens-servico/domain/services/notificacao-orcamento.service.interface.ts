import { IOrdemServico } from '../entities/ordem-servico.entity';

export interface INotificacaoOrcamentoService {
  /**
   * Notifica o cliente que o orçamento foi gerado e aguarda aprovação.
   * Envia links públicos de aprovação e recusa para o email do cliente.
   */
  notificarOrcamentoPendente(
    os: IOrdemServico,
    valorTotal: number,
  ): Promise<void>;
}

export const NOTIFICACAO_ORCAMENTO_SERVICE = 'NOTIFICACAO_ORCAMENTO_SERVICE';
