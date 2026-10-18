import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PrismaService } from '../../../../shared/database';

@ApiTags('Relatórios')
@ApiBearerAuth()
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('tempo-medio-servicos')
  @ApiOperation({ summary: 'Relatório de tempo médio de execução das OS' })
  @ApiResponse({
    status: 200,
    description: 'Tempo médio de execução dos serviços',
  })
  async tempoMedioServicos() {
    const osFinalziadas = await this.prisma.ordemServico.findMany({
      where: {
        status: { in: ['FINALIZADA', 'ENTREGUE'] },
        dataInicioExecucao: { not: null },
        dataFinalizacao: { not: null },
      },
      select: {
        id: true,
        numero: true,
        dataInicioExecucao: true,
        dataFinalizacao: true,
      },
    });

    if (osFinalziadas.length === 0) {
      return {
        totalOS: 0,
        tempoMedioMinutos: 0,
        tempoMedioHoras: 0,
        detalhes: [],
      };
    }

    const detalhes = osFinalziadas.map((os) => {
      const inicio = os.dataInicioExecucao;
      const fim = os.dataFinalizacao;
      const diffMs = fim.getTime() - inicio.getTime();
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
