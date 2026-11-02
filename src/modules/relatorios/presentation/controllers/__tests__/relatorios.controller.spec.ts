import { RelatoriosController } from '../relatorios.controller';
import { TempoMedioServicosUseCase } from '../../../application/use-cases/tempo-medio-servicos.use-case';

describe('RelatoriosController', () => {
  let controller: RelatoriosController;
  let useCase: { execute: jest.Mock };

  beforeEach(() => {
    useCase = { execute: jest.fn() };
    controller = new RelatoriosController(
      useCase as unknown as TempoMedioServicosUseCase,
    );
  });

  it('delega para o TempoMedioServicosUseCase', async () => {
    const expected = {
      totalOS: 2,
      tempoMedioMinutos: 15,
      tempoMedioHoras: 0.25,
      detalhes: [],
    };
    useCase.execute.mockResolvedValue(expected);

    const res = await controller.tempoMedio();

    expect(useCase.execute).toHaveBeenCalledTimes(1);
    expect(res).toEqual(expected);
  });
});
