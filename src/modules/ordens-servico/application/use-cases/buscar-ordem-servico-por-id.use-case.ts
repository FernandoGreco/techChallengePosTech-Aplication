import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IOrdemServicoRepository,
  ORDEM_SERVICO_REPOSITORY,
} from '../../domain/repositories/ordem-servico.repository.interface';
import { IOrdemServico } from '../../domain/entities/ordem-servico.entity';

@Injectable()
export class BuscarOrdemServicoPorIdUseCase {
  constructor(
    @Inject(ORDEM_SERVICO_REPOSITORY)
    private readonly repository: IOrdemServicoRepository,
  ) {}

  async execute(id: string): Promise<IOrdemServico> {
    const os = await this.repository.findById(id);
    if (!os) {
      throw new NotFoundException('Ordem de Serviço não encontrada');
    }
    return os;
  }
}
