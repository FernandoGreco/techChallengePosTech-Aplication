import { Global, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';

/**
 * HealthModule — expõe /health e /ready para os probes do Kubernetes.
 * Global para não exigir import explícito em cada módulo.
 */
@Global()
@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthModule {}
