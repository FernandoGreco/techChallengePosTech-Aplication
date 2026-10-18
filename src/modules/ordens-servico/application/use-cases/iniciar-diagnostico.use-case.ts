import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IOrdemServicoRepository,
  ORDEM_SERVICO_REPOSITORY,
} from '../../domain/repositories/ordem-servico.repository.interface';
import { IOrdemServico } from '../../domain/entities/ordem-servico.entity';
import { StatusOS } from '../../domain/enums/status-os.enum';
import { StatusOSRules } from '../../domain/rules/status-os.rules';

@Injectable()
export class IniciarDiagnosticoUseCase {
  constructor(
    @Inject(ORDEM_SERVICO_REPOSITORY)
    private readonly repository: IOrdemServicoRepository,
  ) {}

  async execute(id: string): Promise<IOrdemServico> {
    const os = await this.repository.findById(id);
    if (!os) {
      throw new NotFoundException('Ordem de Serviço não encontrada');
    }

    StatusOSRules.validarIniciarDiagnostico(os.status);

    return this.repository.transicionarStatus({
      id,
      statusAnterior: StatusOS.RECEBIDA,
      statusNovo: StatusOS.EM_DIAGNOSTICO,
      observacao: 'Diagnóstico iniciado',
      dadosAdicionais: { dataInicioDiagnostico: new Date() },
    });
  }
}
