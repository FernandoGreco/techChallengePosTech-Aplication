import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  CreateOrdemServicoDto,
  ServicoOSDto,
  PecaOSDto,
} from '../create-ordem-servico.dto';
import { AddServicoOSDto } from '../add-servico-os.dto';
import { AddPecaOSDto } from '../add-peca-os.dto';
import { RegistrarDiagnosticoDto } from '../registrar-diagnostico.dto';

describe('Ordens-servico DTOs validation', () => {
  it('CreateOrdemServicoDto valid data', async () => {
    const dto = plainToInstance(CreateOrdemServicoDto, {
      clienteId: '11111111-1111-4111-8111-111111111111',
      veiculoId: '22222222-2222-4222-8222-222222222222',
      servicos: [{ servicoId: '33333333-3333-4333-8333-333333333333' }],
      pecas: [
        { pecaId: '44444444-4444-4444-4444-444444444444', quantidade: 1 },
      ],
    });
    const errors = await validate(dto);
    const props = errors.map((e) => e.property);
    expect(props).not.toContain('clienteId');
    expect(props).not.toContain('veiculoId');
  });

  it('CreateOrdemServicoDto invalid missing clienteId', async () => {
    const dto = plainToInstance(CreateOrdemServicoDto, { veiculoId: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('ServicoOSDto invalid uuid', async () => {
    const dto = plainToInstance(ServicoOSDto, { servicoId: 'not-uuid' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('PecaOSDto invalid quantidade', async () => {
    const dto = plainToInstance(PecaOSDto, { pecaId: '4444', quantidade: 0 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('AddServicoOSDto valid', async () => {
    const dto = plainToInstance(AddServicoOSDto, {
      servicoId: '33333333-3333-4333-8333-333333333333',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('AddPecaOSDto invalid quantidade zero', async () => {
    const dto = plainToInstance(AddPecaOSDto, {
      pecaId: '44444444-4444-4444-4444-444444444444',
      quantidade: 0,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('RegistrarDiagnosticoDto invalid empty', async () => {
    const dto = plainToInstance(RegistrarDiagnosticoDto, { diagnostico: '' });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
