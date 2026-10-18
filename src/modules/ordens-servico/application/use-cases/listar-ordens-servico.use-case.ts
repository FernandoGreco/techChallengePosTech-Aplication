import { Injectable, Inject } from '@nestjs/common';
import {
  IOrdemServicoRepository,
  ORDEM_SERVICO_REPOSITORY,
} from '../../domain/repositories/ordem-servico.repository.interface';
import { IOrdemServico } from '../../domain/entities/ordem-servico.entity';

@Injectable()
export class ListarOrdensServicoUseCase {
  constructor(
    @Inject(ORDEM_SERVICO_REPOSITORY)
    private readonly repository: IOrdemServicoRepository,
  ) {}

  /**
   * Fase 2 — Listagem operacional:
   * - Exclui FINALIZADA e ENTREGUE
   * - Ordena por prioridade: EM_EXECUCAO > AGUARDANDO_APROVACAO > EM_DIAGNOSTICO > RECEBIDA
   * - Dentro do mesmo status: mais antigas primeiro
   */
  async execute(): Promise<IOrdemServico[]> {
    return this.repository.findOperacionais();
  }
}
