import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { OrcamentoActionTokenService } from '../orcamento-action-token.service';

describe('OrcamentoActionTokenService', () => {
  const originalEnv = process.env;
  let service: OrcamentoActionTokenService;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      ORCAMENTO_ACTION_SECRET: 'test-action-secret',
      ORCAMENTO_ACTION_TOKEN_TTL_SECONDS: '60',
    };
    service = new OrcamentoActionTokenService(new JwtService());
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('assina e valida uma ação para a OS e decisão corretas', () => {
    const token = service.create('os-1', 'aprovar');

    expect(() => service.verify(token, 'os-1', 'aprovar')).not.toThrow();
  });

  it('rejeita token usado para outra OS ou decisão', () => {
    const token = service.create('os-1', 'aprovar');

    expect(() => service.verify(token, 'os-2', 'aprovar')).toThrow(
      UnauthorizedException,
    );
    expect(() => service.verify(token, 'os-1', 'recusar')).toThrow(
      UnauthorizedException,
    );
  });

  it('rejeita token malformado', () => {
    expect(() => service.verify('invalid-token', 'os-1', 'aprovar')).toThrow(
      UnauthorizedException,
    );
  });
});
