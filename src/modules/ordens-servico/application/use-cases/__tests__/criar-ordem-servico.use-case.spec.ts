import { CriarOrdemServicoUseCase } from '../criar-ordem-servico.use-case';
import { StatusOS } from '../../../domain/enums/status-os.enum';

const mockRepository = {
  criar: jest.fn(),
  findAll: jest.fn(),
  findOperacionais: jest.fn(),
  findById: jest.fn(),
  findStatusById: jest.fn(),
  adicionarServico: jest.fn(),
  adicionarPeca: jest.fn(),
  atualizarDiagnostico: jest.fn(),
  transicionarStatus: jest.fn(),
  gerarOrcamento: jest.fn(),
  aprovarOrcamento: jest.fn(),
  recusarOrcamento: jest.fn(),
  baixarEstoque: jest.fn(),
};

describe('CriarOrdemServicoUseCase', () => {
  let useCase: CriarOrdemServicoUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CriarOrdemServicoUseCase(mockRepository);
  });

  it('deve criar OS com status RECEBIDA e retornar dados', async () => {
    const dto = { clienteId: 'c1', veiculoId: 'v1' };
    const osResult = {
      id: 'os1',
      status: StatusOS.RECEBIDA,
      servicos: [],
      pecas: [],
      orcamentos: [],
    };
    mockRepository.criar.mockResolvedValue(osResult);

    const result = await useCase.execute(dto);

    expect(mockRepository.criar).toHaveBeenCalledWith({
      clienteId: 'c1',
      veiculoId: 'v1',
      servicos: undefined,
      pecas: undefined,
    });
    expect(result.status).toBe(StatusOS.RECEBIDA);
  });

  it('deve lançar BusinessException se clienteId não for informado', async () => {
    await expect(useCase.execute({ veiculoId: 'v1' } as any)).rejects.toThrow(
      'clienteId é obrigatório',
    );
  });

  it('deve lançar BusinessException se veiculoId não for informado', async () => {
    await expect(useCase.execute({ clienteId: 'c1' } as any)).rejects.toThrow(
      'veiculoId é obrigatório',
    );
  });
});
