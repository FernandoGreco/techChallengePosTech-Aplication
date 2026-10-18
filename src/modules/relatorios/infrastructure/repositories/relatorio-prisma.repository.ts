import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database';
import {
  IRelatorioRepository,
  IOSFinalizadaTempo,
} from '../../domain/repositories/relatorio.repository.interface';

@Injectable()
export class RelatorioPrismaRepository implements IRelatorioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOSFinalizadasComTempoExecucao(): Promise<IOSFinalizadaTempo[]> {
    const result = await this.prisma.ordemServico.findMany({
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

    return result.map((os) => ({
      id: os.id,
      numero: os.numero,
      dataInicioExecucao: os.dataInicioExecucao as Date,
      dataFinalizacao: os.dataFinalizacao as Date,
    }));
  }
}
