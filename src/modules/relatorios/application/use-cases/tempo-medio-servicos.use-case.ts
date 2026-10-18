import { Injectable, Inject } from '@nestjs/common';
import {
  IRelatorioRepository,
  RELATORIO_REPOSITORY,
} from '../../domain/repositories/relatorio.repository.interface';

export interface ITempoMedioServicosDetalhe {
  osNumero: number;
  osId: string;
  tempoMinutos: number;
}

export interface ITempoMedioServicosResult {
  totalOS: number;
  tempoMedioMinutos: number;
  tempoMedioHoras: number;
  detalhes: ITempoMedioServicosDetalhe[];
}

@Injectable()
export class TempoMedioServicosUseCase {
  constructor(
    @Inject(RELATORIO_REPOSITORY)
    private readonly repository: IRelatorioRepository,
  ) {}

  async execute(): Promise<ITempoMedioServicosResult> {
    const osFinalizadas =
      await this.repository.findOSFinalizadasComTempoExecucao();

    if (osFinalizadas.length === 0) {
      return {
        totalOS: 0,
        tempoMedioMinutos: 0,
        tempoMedioHoras: 0,
        detalhes: [],
      };
    }

    const detalhes = osFinalizadas.map((os) => {
      const diffMs =
        os.dataFinalizacao.getTime() - os.dataInicioExecucao.getTime();
      const diffMinutos = Math.round(diffMs / (1000 * 60));
      return {
        osNumero: os.numero,
        osId: os.id,
        tempoMinutos: diffMinutos,
      };
    });

    const totalMinutos = detalhes.reduce((s, d) => s + d.tempoMinutos, 0);
    const tempoMedioMinutos = Math.round(totalMinutos / detalhes.length);

    return {
      totalOS: detalhes.length,
      tempoMedioMinutos,
      tempoMedioHoras: parseFloat((tempoMedioMinutos / 60).toFixed(2)),
      detalhes,
    };
  }
}
