import { NotFoundException, ConflictException } from '@nestjs/common';
import { VeiculosUseCase } from '../veiculos.use-case';

describe('VeiculosUseCase', () => {
  let useCase: VeiculosUseCase;
  const repo: any = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByClienteId: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const prisma: any = {
    cliente: { findUnique: jest.fn() },
    veiculo: { findUnique: jest.fn() },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new VeiculosUseCase(repo, prisma);
  });

  describe('criar', () => {
    it('lança NotFoundException quando cliente não existe', async () => {
      prisma.cliente.findUnique.mockResolvedValue(null);
      await expect(
        useCase.criar({
          clienteId: 'c1',
          placa: 'abc1234',
          modelo: 'X',
        } as any),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('lança ConflictException quando já existe veículo com a placa', async () => {
      prisma.cliente.findUnique.mockResolvedValue({ id: 'c1' });
      prisma.veiculo.findUnique.mockResolvedValue({ id: 'v1' });

      await expect(
        useCase.criar({
          clienteId: 'c1',
          placa: 'abc1234',
          modelo: 'X',
        } as any),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('cria veículo convertendo placa para maiúsculas', async () => {
      prisma.cliente.findUnique.mockResolvedValue({ id: 'c1' });
      prisma.veiculo.findUnique.mockResolvedValue(null);
      repo.create.mockResolvedValue({ id: 'v1', placa: 'ABC1234' });

      const dto = { clienteId: 'c1', placa: 'abc1234', modelo: 'X' } as any;
      const result = await useCase.criar(dto);

      expect(repo.create).toHaveBeenCalledWith({ ...dto, placa: 'ABC1234' });
      expect(result).toEqual({ id: 'v1', placa: 'ABC1234' });
    });
  });

  describe('listarTodos', () => {
    it('retorna todos os veículos', async () => {
      repo.findAll.mockResolvedValue([{ id: 'v1' }]);
      const result = await useCase.listarTodos();
      expect(result).toEqual([{ id: 'v1' }]);
    });
  });

  describe('buscarPorId', () => {
    it('lança NotFoundException quando não encontrado', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(useCase.buscarPorId('v1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('retorna o veículo quando encontrado', async () => {
      repo.findById.mockResolvedValue({ id: 'v1' });
      const result = await useCase.buscarPorId('v1');
      expect(result).toEqual({ id: 'v1' });
    });
  });

  describe('buscarPorClienteId', () => {
    it('delegates to repository', async () => {
      repo.findByClienteId.mockResolvedValue([{ id: 'v1' }]);
      const result = await useCase.buscarPorClienteId('c1');
      expect(result).toEqual([{ id: 'v1' }]);
    });
  });

  describe('atualizar', () => {
    it('chama update com placa em maiúsculas quando presente', async () => {
      repo.findById.mockResolvedValue({ id: 'v1' });
      repo.update.mockResolvedValue({ id: 'v1', placa: 'ABC1234' });

      const result = await useCase.atualizar('v1', { placa: 'abc1234' });
      expect(repo.update).toHaveBeenCalledWith('v1', { placa: 'ABC1234' });
      expect(result).toEqual({ id: 'v1', placa: 'ABC1234' });
    });
  });

  describe('remover', () => {
    it('remove após verificar existência', async () => {
      repo.findById.mockResolvedValue({ id: 'v1' });
      repo.delete.mockResolvedValue(undefined);

      await useCase.remover('v1');
      expect(repo.delete).toHaveBeenCalledWith('v1');
    });
  });
});
