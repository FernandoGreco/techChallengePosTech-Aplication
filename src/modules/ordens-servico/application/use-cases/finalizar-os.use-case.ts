import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IOrdemServicoRepository,
  ORDEM_SERVICO_REPOSITORY,
} from '../../domain/repositories/ordem-servico.repository.interface';
import { IOrdemServico } from '../../domain/entities/ordem-servico.entity';
import { StatusOSRules } from '../../domain/rules/status-os.rules';

@Injectable()
export class FinalizarOSUseCase {
  constructor(
    @Inject(ORDEM_SERVICO_REPOSITORY)
    private readonly repository: IOrdemServicoRepository,
  ) {}

  async execute(id: string): Promise<IOrdemServico> {
    const os = await this.repository.findById(id);
    if (!os) {
      throw new NotFoundException('Ordem de Serviço não encontrada');
    }

    StatusOSRules.validarFinalizar(os.status);

    return this.repository.baixarEstoque({
      id,
      pecas: os.pecas.map((p) => ({
        pecaId: p.pecaId,
        quantidade: p.quantidade,
      })),
    });
  }
}
