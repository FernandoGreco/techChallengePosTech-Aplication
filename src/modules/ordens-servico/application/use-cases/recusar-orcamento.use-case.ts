import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { BusinessException } from '../../../../shared/exceptions';
import {
  IOrdemServicoRepository,
  ORDEM_SERVICO_REPOSITORY,
} from '../../domain/repositories/ordem-servico.repository.interface';
import { IOrdemServico } from '../../domain/entities/ordem-servico.entity';
import { StatusOSRules } from '../../domain/rules/status-os.rules';

@Injectable()
export class RecusarOrcamentoUseCase {
  constructor(
    @Inject(ORDEM_SERVICO_REPOSITORY)
    private readonly repository: IOrdemServicoRepository,
  ) {}

  async execute(id: string): Promise<IOrdemServico> {
    const os = await this.repository.findById(id);
    if (!os) {
      throw new NotFoundException('Ordem de Serviço não encontrada');
    }

    StatusOSRules.validarRecusarOrcamento(os.status);

    const orcamento = os.orcamentos.find((o) => o.status === 'GERADO');
    if (!orcamento) {
      throw new BusinessException(
        'Nenhum orçamento GERADO encontrado para esta OS',
      );
    }

    return this.repository.recusarOrcamento({
      id,
      orcamentoId: orcamento.id,
    });
  }
}
