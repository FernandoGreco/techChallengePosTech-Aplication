import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { BusinessException } from '../../../../shared/exceptions';
import {
  IOrdemServicoRepository,
  ORDEM_SERVICO_REPOSITORY,
} from '../../domain/repositories/ordem-servico.repository.interface';
import { IOrdemServico } from '../../domain/entities/ordem-servico.entity';
import { StatusOS } from '../../domain/enums/status-os.enum';
import { RegistrarDiagnosticoDto } from '../dto/registrar-diagnostico.dto';

@Injectable()
export class RegistrarDiagnosticoUseCase {
  constructor(
    @Inject(ORDEM_SERVICO_REPOSITORY)
    private readonly repository: IOrdemServicoRepository,
  ) {}

  async execute(
    id: string,
    dto: RegistrarDiagnosticoDto,
  ): Promise<IOrdemServico> {
    const os = await this.repository.findById(id);
    if (!os) {
      throw new NotFoundException('Ordem de Serviço não encontrada');
    }

    if (os.status !== StatusOS.EM_DIAGNOSTICO) {
      throw new BusinessException(
        'Só é possível registrar diagnóstico se a OS estiver EM_DIAGNOSTICO',
      );
    }

    return this.repository.atualizarDiagnostico(id, dto.diagnostico);
  }
}
