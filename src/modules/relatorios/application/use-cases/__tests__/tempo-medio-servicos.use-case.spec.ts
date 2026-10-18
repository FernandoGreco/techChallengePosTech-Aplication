import { TempoMedioServicosUseCase } from '../tempo-medio-servicos.use-case';
import { IRelatorioRepository } from '../../../domain/repositories/relatorio.repository.interface';

describe('TempoMedioServicosUseCase', () => {
  let useCase: TempoMedioServicosUseCase;
  let repository: jest.Mocked<IRelatorioRepository>;

  beforeEach(() => {
    repository = {
      findOSFinalizadasComTempoExecucao: jest.fn(),
    };
    useCase = new TempoMedioServicosUseCase(repository);
  });

  it('retorna zeros quando não há OS finalizadas', async () => {
    repository.findOSFinalizadasComTempoExecucao.mockResolvedValue([]);

    const res = await useCase.execute();

    expect(res.totalOS).toBe(0);
    expect(res.tempoMedioMinutos).toBe(0);
    expect(res.tempoMedioHoras).toBe(0);
    expect(res.detalhes).toEqual([]);
  });

  it('calcula tempo médio corretamente quando há OS finalizadas', async () => {
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);

    repository.findOSFinalizadasComTempoExecucao.mockResolvedValue([
      {
        id: '1',
        numero: 1,
        dataInicioExecucao: twentyMinutesAgo,
        dataFinalizacao: now,
      },
      {
        id: '2',
        numero: 2,
        dataInicioExecucao: tenMinutesAgo,
        dataFinalizacao: now,
      },
    ]);

    const res = await useCase.execute();

    expect(res.totalOS).toBe(2);
    expect(res.detalhes).toHaveLength(2);
    expect(res.detalhes[0]).toEqual({
      osNumero: 1,
      osId: '1',
      tempoMinutos: 20,
    });
    expect(res.detalhes[1]).toEqual({
      osNumero: 2,
      osId: '2',
      tempoMinutos: 10,
    });
    // média de 20 e 10 = 15 min
    expect(res.tempoMedioMinutos).toBe(15);
    expect(res.tempoMedioHoras).toBe(0.25);
  });

  it('delega a consulta ao repository', async () => {
    repository.findOSFinalizadasComTempoExecucao.mockResolvedValue([]);

    await useCase.execute();

    expect(repository.findOSFinalizadasComTempoExecucao).toHaveBeenCalledTimes(
      1,
    );
  });
});
