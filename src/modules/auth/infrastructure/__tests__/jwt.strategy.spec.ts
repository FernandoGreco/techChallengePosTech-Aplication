import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from '../jwt.strategy';
import {
  ILambdaJwtPayload,
  IStaffJwtPayload,
} from '../../domain/jwt-payload.types';

describe('JwtStrategy', () => {
  const strategy = new JwtStrategy();

  describe('emissor Lambda (cliente via CPF)', () => {
    it('deve validar payload da Lambda e retornar usuário tipo cliente', () => {
      const payload: ILambdaJwtPayload = {
        sub: 'cliente-123',
        cpf: '12345678900',
        nome: 'João da Silva',
        papel: 'CLIENTE',
        iss: 'oficina-auth-lambda',
        iat: 1,
        exp: 2,
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        id: 'cliente-123',
        tipo: 'cliente',
        cpf: '12345678900',
        nome: 'João da Silva',
      });
    });

    it('deve validar payload da Lambda mesmo sem claims opcionais (nome/papel)', () => {
      const payload: ILambdaJwtPayload = {
        sub: 'cliente-123',
        cpf: '12345678900',
        iss: 'oficina-auth-lambda',
        iat: 1,
        exp: 2,
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        id: 'cliente-123',
        tipo: 'cliente',
        cpf: '12345678900',
        nome: undefined,
      });
    });
  });

  describe('emissor interno (staff)', () => {
    it('deve validar payload interno e retornar usuário tipo staff', () => {
      const payload: IStaffJwtPayload = {
        sub: 'user-1',
        email: 'teste@exemplo.com',
        papel: 'ADMIN',
        iss: 'oficina-staff',
        iat: 1,
        exp: 2,
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        id: 'user-1',
        tipo: 'staff',
        email: 'teste@exemplo.com',
        papel: 'ADMIN',
      });
    });
  });

  describe('emissor desconhecido', () => {
    it('deve rejeitar payload sem iss conhecido', () => {
      const payload = {
        sub: 'x',
        iss: 'outro-emissor',
        iat: 1,
        exp: 2,
      } as never;

      expect(() => strategy.validate(payload)).toThrow(UnauthorizedException);
    });
  });
});
