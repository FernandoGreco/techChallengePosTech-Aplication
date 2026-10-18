import { NotFoundException, ConflictException } from '@nestjs/common';
import { ClientesUseCase } from '../clientes.use-case';

describe('ClientesUseCase', () => {
  let useCase: ClientesUseCase;
  const repo: any = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByDocumento: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ClientesUseCase(repo);
  });

  it('criar lança ConflictException quando documento existe', async () => {
    repo.findByDocumento.mockResolvedValue({ id: 'c1' });
    await expect(
      useCase.criar({ documento: '123' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('criar delega para repository quando não existe', async () => {
    repo.findByDocumento.mockResolvedValue(null);
    repo.create.mockResolvedValue({ id: 'c1' });
    const res = await useCase.criar({ documento: '123' } as any);
    expect(res).toEqual({ id: 'c1' });
  });

  it('buscarPorId lança NotFoundException se não existe', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.buscarPorId('c1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('buscarPorDocumento lança NotFoundException se não existe', async () => {
    repo.findByDocumento.mockResolvedValue(null);
    await expect(useCase.buscarPorDocumento('123')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('atualizar e remover chamam repository após verificar existência', async () => {
    repo.findById.mockResolvedValue({ id: 'c1' });
    repo.update.mockResolvedValue({ id: 'c1', nome: 'X' });
    repo.delete.mockResolvedValue(undefined);

    const up = await useCase.atualizar('c1', { nome: 'X' });
    expect(up).toEqual({ id: 'c1', nome: 'X' });

    await useCase.remover('c1');
    expect(repo.delete).toHaveBeenCalledWith('c1');
  });
});
