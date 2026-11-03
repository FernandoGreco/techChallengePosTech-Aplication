import { RelatorioPrismaRepository } from '../relatorio-prisma.repository';
import { PrismaService } from '../../../../../shared/database';

describe('RelatorioPrismaRepository', () => {
  let repository: RelatorioPrismaRepository;
  let prisma: { ordemServico: { findMany: jest.Mock } };

  beforeEach(() => {
    prisma = { ordemServico: { findMany: jest.fn() } };
    repository = new RelatorioPrismaRepository(
      prisma as unknown as PrismaService,
    );
  });

  it('busca apenas OS finalizadas/entregues com datas de execução preenchidas', async () => {
    prisma.ordemServico.findMany.mockResolvedValue([]);

    await repository.findOSFinalizadasComTempoExecucao();

    expect(prisma.ordemServico.findMany).toHaveBeenCalledWith({
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
  });

  it('mapeia o resultado do Prisma para o contrato de domínio', async () => {
    const inicio = new Date('2026-10-18T10:00:00Z');
    const fim = new Date('2026-10-18T11:00:00Z');
    prisma.ordemServico.findMany.mockResolvedValue([
      {
        id: 'os1',
        numero: 42,
        dataInicioExecucao: inicio,
        dataFinalizacao: fim,
      },
    ]);

    const result = await repository.findOSFinalizadasComTempoExecucao();

    expect(result).toEqual([
      {
        id: 'os1',
        numero: 42,
        dataInicioExecucao: inicio,
        dataFinalizacao: fim,
      },
    ]);
  });
});
