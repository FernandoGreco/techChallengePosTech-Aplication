/**
 * Bootstrap de observabilidade — Datadog APM (dd-trace).
 *
 * Deve ser importado ANTES de qualquer outro módulo no entrypoint (main.ts)
 * para que a auto-instrumentação capture HTTP, Express, Prisma, etc.
 *
 * Sem DD_API_KEY/agente acessível (dev local, testes), o tracer opera em modo
 * no-op: a aplicação funciona normalmente e nenhum dado é enviado.
 */
import tracer from 'dd-trace';

tracer.init({
  service: process.env.DD_SERVICE || 'oficina-mecanica-api',
  env: process.env.DD_ENV || process.env.NODE_ENV || 'development',
  version: process.env.DD_VERSION,
  logInjection: true, // injeta dd.trace_id nos logs JSON (pino)
});

export default tracer;
