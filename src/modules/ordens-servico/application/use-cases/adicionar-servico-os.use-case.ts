import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { BusinessException } from '../../../../shared/exceptions';
import {
  IOrdemServicoRepository,
  ORDEM_SERVICO_REPOSITORY,
} from '../../domain/repositories/ordem-servico.repository.interface';
import { IOrdemServico } from '../../domain/entities/ordem-servico.entity';
import { StatusOS } from '../../domain/enums/status-os.enum';
import { AddServicoOSDto } from '../dto/add-servico-os.dto';

@Injectable()
export class AdicionarServicoOSUseCase {
  constructor(
    @Inject(ORDEM_SERVICO_REPOSITORY)
    private readonly repository: IOrdemServicoRepository,
  ) {}

  async execute(
    ordemServicoId: string,
    dto: AddServicoOSDto,
  ): Promise<IOrdemServico> {
    const os = await this.repository.findById(ordemServicoId);
    if (!os) {
      throw new NotFoundException('Ordem de Serviço não encontrada');
    }

    if (
      os.status !== StatusOS.RECEBIDA &&
      os.status !== StatusOS.EM_DIAGNOSTICO
    ) {
      throw new BusinessException(
        'Só é possível adicionar serviços em OS com status RECEBIDA ou EM_DIAGNOSTICO',
      );
    }

    return this.repository.adicionarServico(ordemServicoId, {
      servicoId: dto.servicoId,
      valor: 0,
    });
  }
}
