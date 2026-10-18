import { NotFoundException } from '@nestjs/common';
import { PecasUseCase } from '../pecas.use-case';
import { EstoqueRules } from '../../../domain/rules/estoque.rules';

describe('PecasUseCase', () => {
  let mockRepo: any;
  let sut: PecasUseCase;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn().mockResolvedValue({}),
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue({
        id: '1',
        quantidadeEstoque: 10,
        quantidadeReservada: 2,
      }),
      update: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockResolvedValue({}),
    };

    sut = new PecasUseCase(mockRepo);

    jest
      .spyOn(EstoqueRules, 'validarDisponibilidade')
      .mockImplementation(() => undefined);
    jest
      .spyOn(EstoqueRules, 'validarBaixaEstoque')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('criar chama repository.create', async () => {
    const dto = { nome: 'x' } as any;
    await sut.criar(dto);
    expect(mockRepo.create).toHaveBeenCalledWith(dto);
  });

  it('listarTodas chama repository.findAll', async () => {
    await sut.listarTodas();
    expect(mockRepo.findAll).toHaveBeenCalled();
  });

  it('buscarPorId retorna quando encontrado', async () => {
    const res = await sut.buscarPorId('1');
    expect(res).toBeDefined();
    expect(mockRepo.findById).toHaveBeenCalledWith('1');
  });

  it('buscarPorId lança NotFoundException quando não encontrado', async () => {
    mockRepo.findById.mockResolvedValueOnce(null);
    await expect(sut.buscarPorId('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('atualizar chama update após buscar', async () => {
    const dto = { nome: 'novo' } as any;
    await sut.atualizar('1', dto);
    expect(mockRepo.update).toHaveBeenCalledWith('1', dto);
  });

  it('remover chama delete após buscar', async () => {
    await sut.remover('1');
    expect(mockRepo.delete).toHaveBeenCalledWith('1');
  });

  it('entradaEstoque atualiza quantidadeEstoque', async () => {
    mockRepo.findById.mockResolvedValueOnce({
      id: '1',
      quantidadeEstoque: 5,
      quantidadeReservada: 0,
    });
    await sut.entradaEstoque('1', 3);
    expect(mockRepo.update).toHaveBeenCalledWith('1', { quantidadeEstoque: 8 });
  });

  it('reservar valida disponibilidade e atualiza quantidadeReservada', async () => {
    mockRepo.findById.mockResolvedValueOnce({
      id: '1',
      quantidadeEstoque: 10,
      quantidadeReservada: 1,
    });
    await sut.reservar('1', 2);
    expect(EstoqueRules.validarDisponibilidade).toHaveBeenCalledWith(10, 1, 2);
    expect(mockRepo.update).toHaveBeenCalledWith('1', {
      quantidadeReservada: 3,
    });
  });

  it('reservar propaga erro quando validarDisponibilidade lança', async () => {
    jest
      .spyOn(EstoqueRules, 'validarDisponibilidade')
      .mockImplementation(() => {
        throw new Error('sem estoque');
      });
    mockRepo.findById.mockResolvedValueOnce({
      id: '1',
      quantidadeEstoque: 0,
      quantidadeReservada: 0,
    });
    await expect(sut.reservar('1', 1)).rejects.toThrow('sem estoque');
  });

  it('baixarEstoque reduz quantidadeReservada corretamente quando sobra', async () => {
    mockRepo.findById.mockResolvedValueOnce({
      id: '1',
      quantidadeEstoque: 20,
      quantidadeReservada: 5,
    });
    await sut.baixarEstoque('1', 2);
    expect(EstoqueRules.validarBaixaEstoque).toHaveBeenCalledWith(20, 2);
    expect(mockRepo.update).toHaveBeenCalledWith('1', {
      quantidadeEstoque: 18,
      quantidadeReservada: 3,
    });
  });

  it('baixarEstoque zera quantidadeReservada quando queda negativa', async () => {
    mockRepo.findById.mockResolvedValueOnce({
      id: '1',
      quantidadeEstoque: 10,
      quantidadeReservada: 1,
    });
    await sut.baixarEstoque('1', 5);
    expect(mockRepo.update).toHaveBeenCalledWith('1', {
      quantidadeEstoque: 5,
      quantidadeReservada: 0,
    });
  });
});
