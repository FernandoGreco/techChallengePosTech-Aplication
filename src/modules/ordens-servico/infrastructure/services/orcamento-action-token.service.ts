import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export type OrcamentoAction = 'aprovar' | 'recusar';

@Injectable()
export class OrcamentoActionTokenService {
  private readonly issuer = 'oficina-mecanica-api';
  private readonly purpose = 'email-orcamento-action';

  constructor(private readonly jwtService: JwtService) {}

  create(osId: string, action: OrcamentoAction): string {
    return this.jwtService.sign(
      { action, purpose: this.purpose },
      {
        secret: this.secret(),
        algorithm: 'HS256',
        issuer: this.issuer,
        subject: osId,
        expiresIn:
          Number(process.env.ORCAMENTO_ACTION_TOKEN_TTL_SECONDS) || 86400,
      },
    );
  }

  verify(token: string, osId: string, action: OrcamentoAction): void {
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        action: OrcamentoAction;
        purpose: string;
      }>(token, {
        secret: this.secret(),
        algorithms: ['HS256'],
        issuer: this.issuer,
      });

      if (
        payload.sub !== osId ||
        payload.action !== action ||
        payload.purpose !== this.purpose
      ) {
        throw new UnauthorizedException('Link de orçamento inválido');
      }
    } catch {
      throw new UnauthorizedException('Link de orçamento inválido ou expirado');
    }
  }

  private secret(): string {
    const actionSecret = process.env.ORCAMENTO_ACTION_SECRET;
    if (actionSecret) return actionSecret;

    if (process.env.NODE_ENV === 'production') {
      throw new Error('ORCAMENTO_ACTION_SECRET não configurado');
    }

    return process.env.JWT_SECRET || 'oficina-mecanica-jwt-secret-dev';
  }
}
