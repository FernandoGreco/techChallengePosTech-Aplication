import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { Public } from '../../modules/auth/domain/decorators/public.decorator';
import { PrismaService } from '../database/prisma.service';

/**
 * HealthController — probes de liveness e readiness para Kubernetes (R6).
 *
 * - `GET /health` (liveness): processo vivo; não verifica dependências.
 * - `GET /ready` (readiness): app pronto para tráfego; verifica conexão com o
 *   banco via SELECT 1. Se o banco cair, o pod sai do Service mas não reinicia.
 *
 * Rotas públicas (sem JWT) — o kubelet não autentica.
 */
@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('health')
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Liveness probe — processo vivo' })
  check(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }

  @Get('ready')
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Readiness probe — banco acessível' })
  readiness(): Promise<HealthCheckResult> {
    return this.health.check([
      async (): Promise<HealthIndicatorResult> => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return { database: { status: 'up' } };
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'unknown error';
          return { database: { status: 'down', message } };
        }
      },
    ]);
  }
}
