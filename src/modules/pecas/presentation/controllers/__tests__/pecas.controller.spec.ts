import { PecasController } from '../pecas.controller';

describe('PecasController', () => {
  let controller: PecasController;
  const mockUseCase = {
    criar: jest.fn(),
    listarTodas: jest.fn(),
    buscarPorId: jest.fn(),
    atualizar: jest.fn(),
    remover: jest.fn(),
    entradaEstoque: jest.fn(),
    reservar: jest.fn(),
    baixarEstoque: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new PecasController(mockUseCase);
  });

  it('criar chama pecasUseCase.criar e retorna', async () => {
    const dto = { nome: 'Filtro' } as any;
    mockUseCase.criar.mockResolvedValue({ id: 'p1', ...dto });
    await expect(controller.criar(dto)).resolves.toEqual({ id: 'p1', ...dto });
    expect(mockUseCase.criar).toHaveBeenCalledWith(dto);
  });

  it('listarTodas chama pecasUseCase.listarTodas e retorna', async () => {
    const result = [{ id: 'p1' }];
    mockUseCase.listarTodas.mockResolvedValue(result);
    await expect(controller.listarTodas()).resolves.toBe(result);
    expect(mockUseCase.listarTodas).toHaveBeenCalled();
  });

  it('buscarPorId chama pecasUseCase.buscarPorId com id', async () => {
    mockUseCase.buscarPorId.mockResolvedValue({ id: 'p1' });
    await expect(controller.buscarPorId('p1')).resolves.toEqual({ id: 'p1' });
    expect(mockUseCase.buscarPorId).toHaveBeenCalledWith('p1');
  });

  it('atualizar chama pecasUseCase.atualizar com id e dto', async () => {
    const dto = { nome: 'Novo' } as any;
    mockUseCase.atualizar.mockResolvedValue({ id: 'p1', ...dto });
    await expect(controller.atualizar('p1', dto)).resolves.toEqual({
      id: 'p1',
      ...dto,
    });
    expect(mockUseCase.atualizar).toHaveBeenCalledWith('p1', dto);
  });

  it('remover chama pecasUseCase.remover com id', async () => {
    mockUseCase.remover.mockResolvedValue({ success: true });
    await expect(controller.remover('p1')).resolves.toEqual({ success: true });
    expect(mockUseCase.remover).toHaveBeenCalledWith('p1');
  });

  it('entradaEstoque chama pecasUseCase.entradaEstoque com id e quantidade', async () => {
    mockUseCase.entradaEstoque.mockResolvedValue({ success: true });
    await expect(
      controller.entradaEstoque('p1', { quantidade: 5 } as any),
    ).resolves.toEqual({ success: true });
    expect(mockUseCase.entradaEstoque).toHaveBeenCalledWith('p1', 5);
  });

  it('reservar chama pecasUseCase.reservar com id e quantidade', async () => {
    mockUseCase.reservar.mockResolvedValue({ success: true });
    await expect(
      controller.reservar('p1', { quantidade: 2 } as any),
    ).resolves.toEqual({ success: true });
    expect(mockUseCase.reservar).toHaveBeenCalledWith('p1', 2);
  });

  it('baixarEstoque chama pecasUseCase.baixarEstoque com id e quantidade', async () => {
    mockUseCase.baixarEstoque.mockResolvedValue({ success: true });
    await expect(
      controller.baixarEstoque('p1', { quantidade: 1 } as any),
    ).resolves.toEqual({ success: true });
    expect(mockUseCase.baixarEstoque).toHaveBeenCalledWith('p1', 1);
  });
});
