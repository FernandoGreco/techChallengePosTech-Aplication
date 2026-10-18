import { ServicosController } from '../servicos.controller';

describe('ServicosController', () => {
  let controller: ServicosController;
  const mockUseCase = {
    criar: jest.fn(),
    listarTodos: jest.fn(),
    buscarPorId: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ServicosController(mockUseCase);
  });

  it('criar chama servicosUseCase.criar e retorna', async () => {
    const dto = { nome: 'Troca óleo' } as any;
    mockUseCase.criar.mockResolvedValue({ id: 's1', ...dto });
    await expect(controller.criar(dto)).resolves.toEqual({ id: 's1', ...dto });
    expect(mockUseCase.criar).toHaveBeenCalledWith(dto);
  });

  it('listarTodos chama servicosUseCase.listarTodos e retorna', async () => {
    const result = [{ id: 's1' }];
    mockUseCase.listarTodos.mockResolvedValue(result);
    await expect(controller.listarTodos()).resolves.toBe(result);
    expect(mockUseCase.listarTodos).toHaveBeenCalled();
  });

  it('buscarPorId chama servicosUseCase.buscarPorId com id', async () => {
    mockUseCase.buscarPorId.mockResolvedValue({ id: 's1' });
    await expect(controller.buscarPorId('s1')).resolves.toEqual({ id: 's1' });
    expect(mockUseCase.buscarPorId).toHaveBeenCalledWith('s1');
  });

  it('atualizar chama servicosUseCase.atualizar com id e dto', async () => {
    const dto = { nome: 'Serviço novo' } as any;
    mockUseCase.atualizar.mockResolvedValue({ id: 's1', ...dto });
    await expect(controller.atualizar('s1', dto)).resolves.toEqual({
      id: 's1',
      ...dto,
    });
    expect(mockUseCase.atualizar).toHaveBeenCalledWith('s1', dto);
  });

  it('remover chama servicosUseCase.remover com id', async () => {
    mockUseCase.remover.mockResolvedValue({ success: true });
    await expect(controller.remover('s1')).resolves.toEqual({ success: true });
    expect(mockUseCase.remover).toHaveBeenCalledWith('s1');
  });
});
