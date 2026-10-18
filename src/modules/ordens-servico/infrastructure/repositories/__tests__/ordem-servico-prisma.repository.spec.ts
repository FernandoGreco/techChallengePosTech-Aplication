import { OrdemServicoPrismaRepository } from '../ordem-servico-prisma.repository';
import { StatusOS } from '../../../domain/enums/status-os.enum';

const makeOS = (id: string, status: StatusOS, dataCriacao: Date) => ({
  id,
  numero: 1,
  clienteId: 'c1',
  veiculoId: 'v1',
  status,
  diagnostico: null,
  valorTotal: 0,
  dataCriacao,
  dataInicioDiagnostico: null,
  dataInicioExecucao: null,
  dataFinalizacao: null,
  dataEntrega: null,
  createdAt: dataCriacao,
  updatedAt: dataCriacao,
  cliente: null,
  veiculo: null,
  servicos: [],
  pecas: [],
  orcamentos: [],
  historico: [],
});

const mockPrisma = {
  ordemServico: { findMany: jest.fn(), findUnique: jest.fn() },
} as any;

describe('OrdemServicoPrismaRepository — findOperacionais', () => {
  let repository: OrdemServicoPrismaRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new OrdemServicoPrismaRepository(mockPrisma);
  });

  it('deve excluir FINALIZADA e ENTREGUE via cláusula WHERE do Prisma', async () => {
    const agora = new Date();
    // Mock retorna apenas itens não-terminais (como o Prisma faria com o WHERE)
    mockPrisma.ordemServico.findMany.mockResolvedValue([
      makeOS('os1', StatusOS.RECEBIDA, agora),
    ]);

    const result = await repository.findOperacionais();

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('os1');
    expect(mockPrisma.ordemServico.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: { notIn: [StatusOS.FINALIZADA, StatusOS.ENTREGUE] } },
      }),
    );
  });

  it('deve ordenar por prioridade: EM_EXECUCAO > AGUARDANDO_APROVACAO > EM_DIAGNOSTICO > RECEBIDA', async () => {
    const base = new Date('2025-01-01');
    mockPrisma.ordemServico.findMany.mockResolvedValue([
      makeOS('r', StatusOS.RECEBIDA, base),
      makeOS('d', StatusOS.EM_DIAGNOSTICO, base),
      makeOS('e', StatusOS.EM_EXECUCAO, base),
      makeOS('a', StatusOS.AGUARDANDO_APROVACAO, base),
    ]);

    const result = await repository.findOperacionais();

    expect(result.map((o) => o.status)).toEqual([
      StatusOS.EM_EXECUCAO,
      StatusOS.AGUARDANDO_APROVACAO,
      StatusOS.EM_DIAGNOSTICO,
      StatusOS.RECEBIDA,
    ]);
  });

  it('dentro do mesmo status, deve ordenar as mais antigas primeiro', async () => {
    const mais_antiga = new Date('2025-01-01');
    const mais_nova = new Date('2025-06-01');
    mockPrisma.ordemServico.findMany.mockResolvedValue([
      makeOS('nova', StatusOS.RECEBIDA, mais_nova),
      makeOS('antiga', StatusOS.RECEBIDA, mais_antiga),
    ]);

    const result = await repository.findOperacionais();

    expect(result[0].id).toBe('antiga');
    expect(result[1].id).toBe('nova');
  });

  it('deve combinar ordenação por prioridade e data dentro do status', async () => {
    const d1 = new Date('2025-01-01');
    const d2 = new Date('2025-06-01');
    mockPrisma.ordemServico.findMany.mockResolvedValue([
      makeOS('exec_nova', StatusOS.EM_EXECUCAO, d2),
      makeOS('exec_antiga', StatusOS.EM_EXECUCAO, d1),
      makeOS('rec', StatusOS.RECEBIDA, d1),
    ]);

    const result = await repository.findOperacionais();

    expect(result[0].id).toBe('exec_antiga');
    expect(result[1].id).toBe('exec_nova');
    expect(result[2].id).toBe('rec');
  });
});
