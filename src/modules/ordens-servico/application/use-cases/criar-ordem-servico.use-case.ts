import { Injectable, Inject } from '@nestjs/common';
import { BusinessException } from '../../../../shared/exceptions';
import {
  IOrdemServicoRepository,
  ORDEM_SERVICO_REPOSITORY,
  ICriarOSInput,
} from '../../domain/repositories/ordem-servico.repository.interface';
import { IOrdemServico } from '../../domain/entities/ordem-servico.entity';
import { StatusOS } from '../../domain/enums/status-os.enum';
import { CreateOrdemServicoDto } from '../dto/create-ordem-servico.dto';

@Injectable()
export class CriarOrdemServicoUseCase {
  constructor(
    @Inject(ORDEM_SERVICO_REPOSITORY)
    private readonly repository: IOrdemServicoRepository,
  ) {}

  async execute(dto: CreateOrdemServicoDto): Promise<IOrdemServico> {
    if (!dto.clienteId) {
      throw new BusinessException('clienteId é obrigatório');
    }
    if (!dto.veiculoId) {
      throw new BusinessException('veiculoId é obrigatório');
    }

    const input: ICriarOSInput = {
      clienteId: dto.clienteId,
      veiculoId: dto.veiculoId,
      servicos: dto.servicos,
      pecas: dto.pecas,
    };

    const os = await this.repository.criar(input);

    if (os.status !== StatusOS.RECEBIDA) {
      throw new BusinessException('OS criada com status inválido');
    }

    return os;
  }
}
