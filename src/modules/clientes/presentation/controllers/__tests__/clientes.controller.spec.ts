import { ClientesController } from '../clientes.controller';

describe('ClientesController', () => {
  let controller: ClientesController;
  const mockUseCase = {
    criar: jest.fn(),
    listarTodos: jest.fn(),
    buscarPorId: jest.fn(),
    buscarPorDocumento: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ClientesController(mockUseCase);
  });

  it('criar chama clientesUseCase.criar e retorna resultado', async () => {
    const dto = { nome: 'Fulano' } as any;
    mockUseCase.criar.mockResolvedValue({ id: '1', ...dto });
    await expect(controller.criar(dto)).resolves.toEqual({ id: '1', ...dto });
    expect(mockUseCase.criar).toHaveBeenCalledWith(dto);
  });

  it('listarTodos chama clientesUseCase.listarTodos e retorna resultado', async () => {
    const result = [{ id: '1' }];
    mockUseCase.listarTodos.mockResolvedValue(result);
    await expect(controller.listarTodos()).resolves.toBe(result);
    expect(mockUseCase.listarTodos).toHaveBeenCalled();
  });

  it('buscarPorId chama clientesUseCase.buscarPorId com id', async () => {
    mockUseCase.buscarPorId.mockResolvedValue({ id: '1' });
    await expect(controller.buscarPorId('1')).resolves.toEqual({ id: '1' });
    expect(mockUseCase.buscarPorId).toHaveBeenCalledWith('1');
  });

  it('buscarPorDocumento chama clientesUseCase.buscarPorDocumento com documento', async () => {
    mockUseCase.buscarPorDocumento.mockResolvedValue({ id: '1' });
    await expect(controller.buscarPorDocumento('123')).resolves.toEqual({
      id: '1',
    });
    expect(mockUseCase.buscarPorDocumento).toHaveBeenCalledWith('123');
  });

  it('atualizar chama clientesUseCase.atualizar com id e dto', async () => {
    const dto = { nome: 'Novo' } as any;
    mockUseCase.atualizar.mockResolvedValue({ id: '1', ...dto });
    await expect(controller.atualizar('1', dto)).resolves.toEqual({
      id: '1',
      ...dto,
    });
    expect(mockUseCase.atualizar).toHaveBeenCalledWith('1', dto);
  });

  it('remover chama clientesUseCase.remover com id', async () => {
    mockUseCase.remover.mockResolvedValue({ success: true });
    await expect(controller.remover('1')).resolves.toEqual({ success: true });
    expect(mockUseCase.remover).toHaveBeenCalledWith('1');
  });
});
