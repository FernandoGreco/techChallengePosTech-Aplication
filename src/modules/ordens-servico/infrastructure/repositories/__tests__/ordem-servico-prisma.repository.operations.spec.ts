import { NotFoundException } from '@nestjs/common';
import { OrdemServicoPrismaRepository } from '../ordem-servico-prisma.repository';
import { StatusOS } from '../../../domain/enums/status-os.enum';

const makeOSRecord = (
  id: string,
  status: StatusOS,
  dataCriacao = new Date(),
) => ({
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

const makeTx = () => ({
  ordemServico: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
  historicoStatusOS: { create: jest.fn() },
  orcamento: { create: jest.fn(), update: jest.fn() },
  servico: { findUnique: jest.fn() },
  peca: { findUnique: jest.fn(), update: jest.fn() },
  ordemServicoServico: { create: jest.fn() },
  ordemServicoPeca: { create: jest.fn() },
});

const makePrisma = () => ({
  cliente: { findUnique: jest.fn() },
  veiculo: { findUnique: jest.fn() },
  ordemServico: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  ordemServicoServico: { create: jest.fn() },
  ordemServicoPeca: { create: jest.fn() },
  servico: { findUnique: jest.fn() },
  peca: { findUnique: jest.fn() },
  historicoStatusOS: { create: jest.fn() },
  orcamento: { create: jest.fn(), update: jest.fn() },
  $transaction: jest.fn(),
});

describe('OrdemServicoPrismaRepository', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let repository: OrdemServicoPrismaRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = makePrisma();
    repository = new OrdemServicoPrismaRepository(prisma as any);
  });

  // ─── findById ──────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('deve retornar domain entity quando encontrado', async () => {
      prisma.ordemServico.findUnique.mockResolvedValue(
        makeOSRecord('os1', StatusOS.RECEBIDA),
      );

      const result = await repository.findById('os1');

      expect(result).not.toBeNull();
      expect(result.id).toBe('os1');
      expect(result.status).toBe(StatusOS.RECEBIDA);
    });

    it('deve retornar null quando não encontrado', async () => {
      prisma.ordemServico.findUnique.mockResolvedValue(null);

      const result = await repository.findById('nope');

      expect(result).toBeNull();
    });
  });

  // ─── findAll ───────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('deve retornar lista mapeada em domain entities', async () => {
      prisma.ordemServico.findMany.mockResolvedValue([
        makeOSRecord('os1', StatusOS.RECEBIDA),
        makeOSRecord('os2', StatusOS.FINALIZADA),
      ]);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('os1');
      expect(result[1].id).toBe('os2');
    });
  });

  // ─── findStatusById ────────────────────────────────────────────────────────

  describe('findStatusById', () => {
    it('deve retornar status consulta quando encontrado', async () => {
      prisma.ordemServico.findUnique.mockResolvedValue(
        makeOSRecord('os1', StatusOS.EM_DIAGNOSTICO),
      );

      const result = await repository.findStatusById('os1');

      expect(result).not.toBeNull();
      expect(result.status).toBe(StatusOS.EM_DIAGNOSTICO);
    });

    it('deve retornar null quando não encontrado', async () => {
      prisma.ordemServico.findUnique.mockResolvedValue(null);

      const result = await repository.findStatusById('nope');

      expect(result).toBeNull();
    });
  });

  // ─── criar ─────────────────────────────────────────────────────────────────

  describe('criar', () => {
    it('deve lançar NotFoundException quando cliente não existe', async () => {
      prisma.cliente.findUnique.mockResolvedValue(null);

      await expect(
        repository.criar({ clienteId: 'c1', veiculoId: 'v1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException quando veículo não existe', async () => {
      prisma.cliente.findUnique.mockResolvedValue({ id: 'c1' });
      prisma.veiculo.findUnique.mockResolvedValue(null);

      await expect(
        repository.criar({ clienteId: 'c1', veiculoId: 'v1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException quando veículo não pertence ao cliente', async () => {
      prisma.cliente.findUnique.mockResolvedValue({ id: 'c1' });
      prisma.veiculo.findUnique.mockResolvedValue({
        id: 'v1',
        clienteId: 'outro-cliente',
      });

      await expect(
        repository.criar({ clienteId: 'c1', veiculoId: 'v1' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve criar OS simples via transaction', async () => {
      prisma.cliente.findUnique.mockResolvedValue({ id: 'c1' });
      prisma.veiculo.findUnique.mockResolvedValue({
        id: 'v1',
        clienteId: 'c1',
      });

      const tx = makeTx();
      tx.ordemServico.create.mockResolvedValue({ id: 'os-new' });
      tx.historicoStatusOS.create.mockResolvedValue({});
      prisma.$transaction.mockImplementation((cb: any) => cb(tx));

      prisma.ordemServico.findUnique.mockResolvedValue(
        makeOSRecord('os-new', StatusOS.RECEBIDA),
      );

      const result = await repository.criar({
        clienteId: 'c1',
        veiculoId: 'v1',
      });

      expect(tx.ordemServico.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: StatusOS.RECEBIDA }),
        }),
      );
      expect(result.id).toBe('os-new');
    });
  });

  // ─── atualizarDiagnostico ──────────────────────────────────────────────────

  describe('atualizarDiagnostico', () => {
    it('deve atualizar campo diagnostico e retornar OS atualizada', async () => {
      prisma.ordemServico.update.mockResolvedValue({});
      prisma.ordemServico.findUnique.mockResolvedValue(
        makeOSRecord('os1', StatusOS.EM_DIAGNOSTICO),
      );

      const result = await repository.atualizarDiagnostico(
        'os1',
        'Motor desgastado',
      );

      expect(prisma.ordemServico.update).toHaveBeenCalledWith({
        where: { id: 'os1' },
        data: { diagnostico: 'Motor desgastado' },
      });
      expect(result.id).toBe('os1');
    });
  });

  // ─── transicionarStatus ────────────────────────────────────────────────────

  describe('transicionarStatus', () => {
    it('deve atualizar status e criar histórico atomicamente', async () => {
      prisma.$transaction.mockResolvedValue([{}, {}]);
      prisma.ordemServico.findUnique.mockResolvedValue(
        makeOSRecord('os1', StatusOS.EM_DIAGNOSTICO),
      );

      await repository.transicionarStatus({
        id: 'os1',
        statusAnterior: StatusOS.RECEBIDA,
        statusNovo: StatusOS.EM_DIAGNOSTICO,
        observacao: 'Diagnóstico iniciado',
      });

      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  // ─── adicionarServico ──────────────────────────────────────────────────────

  describe('adicionarServico', () => {
    it('deve lançar NotFoundException quando serviço não existe', async () => {
      prisma.servico.findUnique.mockResolvedValue(null);

      await expect(
        repository.adicionarServico('os1', { servicoId: 's-nope', valor: 0 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve criar registro e retornar OS atualizada', async () => {
      prisma.servico.findUnique.mockResolvedValue({ id: 's1', precoBase: 200 });
      prisma.ordemServicoServico.create.mockResolvedValue({});
      prisma.ordemServico.findUnique.mockResolvedValue(
        makeOSRecord('os1', StatusOS.RECEBIDA),
      );

      const result = await repository.adicionarServico('os1', {
        servicoId: 's1',
        valor: 0,
      });

      expect(prisma.ordemServicoServico.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ servicoId: 's1', valor: 200 }),
        }),
      );
      expect(result.id).toBe('os1');
    });
  });

  // ─── adicionarPeca ─────────────────────────────────────────────────────────

  describe('adicionarPeca', () => {
    it('deve lançar NotFoundException quando peça não existe', async () => {
      prisma.peca.findUnique.mockResolvedValue(null);

      await expect(
        repository.adicionarPeca('os1', {
          pecaId: 'p-nope',
          quantidade: 1,
          valorUnitario: 0,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve criar registro e retornar OS atualizada', async () => {
      prisma.peca.findUnique.mockResolvedValue({ id: 'p1', precoUnitario: 80 });
      prisma.ordemServicoPeca.create.mockResolvedValue({});
      prisma.ordemServico.findUnique.mockResolvedValue(
        makeOSRecord('os1', StatusOS.RECEBIDA),
      );

      const result = await repository.adicionarPeca('os1', {
        pecaId: 'p1',
        quantidade: 3,
        valorUnitario: 0,
      });

      expect(prisma.ordemServicoPeca.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            pecaId: 'p1',
            quantidade: 3,
            valorUnitario: 80,
          }),
        }),
      );
      expect(result.id).toBe('os1');
    });
  });
});
