import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IJwtPayload, IAuthenticatedUser } from '../domain/jwt-payload.types';

/**
 * JwtStrategy — valida tokens de dois emissores (multi-issuer, RFC-003):
 *
 * - Lambda (clientes, iss=oficina-auth-lambda): auth por CPF, claims { sub, cpf, nome?, papel? }
 * - App interno (staff, iss=oficina-staff): login email+senha, claims { sub, email, papel }
 *
 * Ambos usam HS256 com o mesmo JWT_SECRET (contrato C1). A verificação fica
 * abstraída aqui para permitir migração futura para RS256/JWKS sem refatorar
 * os consumidores.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'oficina-mecanica-jwt-secret-dev',
    });
  }

  validate(payload: IJwtPayload): IAuthenticatedUser {
    if (payload.iss === 'oficina-auth-lambda') {
      return {
        id: payload.sub,
        tipo: 'cliente',
        cpf: payload.cpf,
        nome: payload.nome,
      };
    }

    if (payload.iss === 'oficina-staff') {
      return {
        id: payload.sub,
        tipo: 'staff',
        email: payload.email,
        papel: payload.papel,
      };
    }

    throw new UnauthorizedException('Emissor de token desconhecido');
  }
}
