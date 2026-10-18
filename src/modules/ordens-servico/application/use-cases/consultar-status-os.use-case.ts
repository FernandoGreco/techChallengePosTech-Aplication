import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IOrdemServicoRepository,
  ORDEM_SERVICO_REPOSITORY,
} from '../../domain/repositories/ordem-servico.repository.interface';
import { IStatusConsulta } from '../../domain/entities/ordem-servico.entity';

@Injectable()
export class ConsultarStatusOSUseCase {
  constructor(
    @Inject(ORDEM_SERVICO_REPOSITORY)
    private readonly repository: IOrdemServicoRepository,
  ) {}

  async execute(id: string): Promise<IStatusConsulta> {
    const status = await this.repository.findStatusById(id);
    if (!status) {
      throw new NotFoundException('Ordem de Serviço não encontrada');
    }
    return status;
  }
}
