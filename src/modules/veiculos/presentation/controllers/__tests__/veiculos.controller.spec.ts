import { VeiculosController } from '../veiculos.controller';

describe('VeiculosController', () => {
  let controller: VeiculosController;
  const mockUseCase = {
    criar: jest.fn(),
    listarTodos: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorClienteId: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new VeiculosController(mockUseCase);
  });

  it('criar chama veiculosUseCase.criar e retorna', async () => {
    const dto = { modelo: 'Fusca' } as any;
    mockUseCase.criar.mockResolvedValue({ id: 'v1', ...dto });
    await expect(controller.criar(dto)).resolves.toEqual({ id: 'v1', ...dto });
    expect(mockUseCase.criar).toHaveBeenCalledWith(dto);
  });

  it('listarTodos chama veiculosUseCase.listarTodos e retorna', async () => {
    const result = [{ id: 'v1' }];
    mockUseCase.listarTodos.mockResolvedValue(result);
    await expect(controller.listarTodos()).resolves.toBe(result);
    expect(mockUseCase.listarTodos).toHaveBeenCalled();
  });

  it('buscarPorId chama veiculosUseCase.buscarPorId com id', async () => {
    mockUseCase.buscarPorId.mockResolvedValue({ id: 'v1' });
    await expect(controller.buscarPorId('v1')).resolves.toEqual({ id: 'v1' });
    expect(mockUseCase.buscarPorId).toHaveBeenCalledWith('v1');
  });

  it('buscarPorClienteId chama veiculosUseCase.buscarPorClienteId com clienteId', async () => {
    mockUseCase.buscarPorClienteId.mockResolvedValue([{ id: 'v1' }]);
    await expect(controller.buscarPorClienteId('c1')).resolves.toEqual([
      { id: 'v1' },
    ]);
    expect(mockUseCase.buscarPorClienteId).toHaveBeenCalledWith('c1');
  });

  it('atualizar chama veiculosUseCase.atualizar com id e dto', async () => {
    const dto = { modelo: 'Novo' } as any;
    mockUseCase.atualizar.mockResolvedValue({ id: 'v1', ...dto });
    await expect(controller.atualizar('v1', dto)).resolves.toEqual({
      id: 'v1',
      ...dto,
    });
    expect(mockUseCase.atualizar).toHaveBeenCalledWith('v1', dto);
  });

  it('remover chama veiculosUseCase.remover com id', async () => {
    mockUseCase.remover.mockResolvedValue({ success: true });
    await expect(controller.remover('v1')).resolves.toEqual({ success: true });
    expect(mockUseCase.remover).toHaveBeenCalledWith('v1');
  });
});
