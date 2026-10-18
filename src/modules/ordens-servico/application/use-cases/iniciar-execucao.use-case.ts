import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { BusinessException } from '../../../../shared/exceptions';
import {
  IOrdemServicoRepository,
  ORDEM_SERVICO_REPOSITORY,
} from '../../domain/repositories/ordem-servico.repository.interface';
import { IOrdemServico } from '../../domain/entities/ordem-servico.entity';
import { StatusOS } from '../../domain/enums/status-os.enum';

@Injectable()
export class IniciarExecucaoUseCase {
  constructor(
    @Inject(ORDEM_SERVICO_REPOSITORY)
    private readonly repository: IOrdemServicoRepository,
  ) {}

  async execute(id: string): Promise<IOrdemServico> {
    const os = await this.repository.findById(id);
    if (!os) {
      throw new NotFoundException('Ordem de Serviço não encontrada');
    }

    if (os.status !== StatusOS.AGUARDANDO_APROVACAO) {
      throw new BusinessException(
        'Só é possível iniciar execução se a OS estiver AGUARDANDO_APROVACAO',
      );
    }

    const orcamentoAprovado = os.orcamentos.find(
      (o) => o.status === 'APROVADO',
    );
    if (!orcamentoAprovado) {
      throw new BusinessException(
        'Só é possível iniciar execução se o orçamento estiver aprovado',
      );
    }

    return this.repository.transicionarStatus({
      id,
      statusAnterior: StatusOS.AGUARDANDO_APROVACAO,
      statusNovo: StatusOS.EM_EXECUCAO,
      observacao: 'Execução iniciada',
      dadosAdicionais: { dataInicioExecucao: new Date() },
    });
  }
}
