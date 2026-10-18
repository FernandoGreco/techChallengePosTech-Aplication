import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { BusinessException } from '../../../../shared/exceptions';
import {
  IOrdemServicoRepository,
  ORDEM_SERVICO_REPOSITORY,
} from '../../domain/repositories/ordem-servico.repository.interface';
import { IOrdemServico } from '../../domain/entities/ordem-servico.entity';
import { StatusOSRules } from '../../domain/rules/status-os.rules';
import { EstoqueRules } from '../../../pecas/domain/rules/estoque.rules';

@Injectable()
export class AprovarOrcamentoUseCase {
  constructor(
    @Inject(ORDEM_SERVICO_REPOSITORY)
    private readonly repository: IOrdemServicoRepository,
  ) {}

  async execute(id: string): Promise<IOrdemServico> {
    const os = await this.repository.findById(id);
    if (!os) {
      throw new NotFoundException('Ordem de Serviço não encontrada');
    }

    StatusOSRules.validarAprovarOrcamento(os.status);

    const orcamento = os.orcamentos.find((o) => o.status === 'GERADO');
    if (!orcamento) {
      throw new BusinessException(
        'Nenhum orçamento GERADO encontrado para esta OS',
      );
    }

    for (const pecaOS of os.pecas) {
      if (!pecaOS.peca) {
        throw new NotFoundException(
          `Dados da peça ${pecaOS.pecaId} não encontrados`,
        );
      }
      EstoqueRules.validarDisponibilidade(
        pecaOS.peca.quantidadeEstoque,
        pecaOS.peca.quantidadeReservada,
        pecaOS.quantidade,
      );
    }

    return this.repository.aprovarOrcamento({
      id,
      orcamentoId: orcamento.id,
      reservas: os.pecas.map((p) => ({
        pecaId: p.pecaId,
        quantidade: p.quantidade,
      })),
    });
  }
}
