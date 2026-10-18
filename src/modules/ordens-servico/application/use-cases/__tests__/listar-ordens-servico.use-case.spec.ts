import { ListarOrdensServicoUseCase } from '../listar-ordens-servico.use-case';
import { StatusOS } from '../../../domain/enums/status-os.enum';

const mockRepository = {
  findOperacionais: jest.fn(),
} as any;

const makeOS = (id: string, status: StatusOS, dataCriacao: Date) => ({
  id,
  status,
  dataCriacao,
  servicos: [],
  pecas: [],
  orcamentos: [],
});

describe('ListarOrdensServicoUseCase', () => {
  let useCase: ListarOrdensServicoUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ListarOrdensServicoUseCase(mockRepository);
  });

  it('deve delegar ao repository.findOperacionais', async () => {
    const result = [makeOS('o1', StatusOS.RECEBIDA, new Date())];
    mockRepository.findOperacionais.mockResolvedValue(result);

    const output = await useCase.execute();
    expect(mockRepository.findOperacionais).toHaveBeenCalledTimes(1);
    expect(output).toBe(result);
  });

  it('deve retornar lista vazia quando não há OS operacionais', async () => {
    mockRepository.findOperacionais.mockResolvedValue([]);
    const output = await useCase.execute();
    expect(output).toEqual([]);
  });
});
