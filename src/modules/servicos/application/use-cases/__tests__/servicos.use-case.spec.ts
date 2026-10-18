import { NotFoundException } from '@nestjs/common';
import { ServicosUseCase } from '../servicos.use-case';

describe('ServicosUseCase', () => {
  let useCase: ServicosUseCase;
  const repo: any = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ServicosUseCase(repo);
  });

  it('cria serviço', async () => {
    const dto = { nome: 'X', precoBase: 10 } as any;
    repo.create.mockResolvedValue({ id: 's1', ...dto });
    const res = await useCase.criar(dto);
    expect(res).toEqual({ id: 's1', ...dto });
  });

  it('lista todos', async () => {
    repo.findAll.mockResolvedValue([{ id: 's1' }]);
    const res = await useCase.listarTodos();
    expect(res).toEqual([{ id: 's1' }]);
  });

  it('buscarPorId lança NotFoundException se não existe', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(useCase.buscarPorId('s1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('buscarPorId retorna quando existe', async () => {
    repo.findById.mockResolvedValue({ id: 's1' });
    const res = await useCase.buscarPorId('s1');
    expect(res).toEqual({ id: 's1' });
  });

  it('atualizar chama update após verificar existência', async () => {
    repo.findById.mockResolvedValue({ id: 's1' });
    repo.update.mockResolvedValue({ id: 's1', nome: 'Y' });
    const res = await useCase.atualizar('s1', { nome: 'Y' });
    expect(repo.update).toHaveBeenCalledWith('s1', { nome: 'Y' });
    expect(res).toEqual({ id: 's1', nome: 'Y' });
  });

  it('remover chama delete após verificar existência', async () => {
    repo.findById.mockResolvedValue({ id: 's1' });
    repo.delete.mockResolvedValue(undefined);
    await useCase.remover('s1');
    expect(repo.delete).toHaveBeenCalledWith('s1');
  });
});
