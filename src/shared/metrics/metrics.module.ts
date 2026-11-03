import { Global, Module } from '@nestjs/common';
import { MetricsService } from './metrics.service';

/**
 * MetricsModule — provê MetricsService globalmente para injeção nos use cases
 * sem exigir import explícito em cada módulo de domínio.
 */
@Global()
@Module({
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
