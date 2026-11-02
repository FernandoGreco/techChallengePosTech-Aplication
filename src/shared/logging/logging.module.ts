import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { extractOrGenerateCorrelationId } from './correlation-id.util';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * LoggingModule — logs estruturados em JSON (pino) com correlation-id.
 *
 * Produção: saída JSON pura (uma linha por log), parseável pelo Datadog/New Relic.
 * Desenvolvimento: pino-pretty para legibilidade humana.
 *
 * O correlation-id vem do header `x-correlation-id` propagado pelo API Gateway;
 * se ausente, um UUID é gerado. Ele é anexado a todos os logs da requisição e
 * devolvido no header de resposta, permitindo correlação ponta a ponta.
 */
@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
        ...(isProduction
          ? {}
          : {
              transport: {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  translateTime: 'SYS:standard',
                },
              },
            }),
        genReqId: (req) => extractOrGenerateCorrelationId(req.headers),
        customProps: (req) => ({
          correlationId: req.id,
        }),
        serializers: {
          req: (req) => ({
            method: req.method,
            url: req.url,
            correlationId: req.id,
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
        // Devolve o correlation-id no header de resposta
        customAttributeKeys: { responseTime: 'responseTimeMs' },
      },
    }),
  ],
})
export class LoggingModule {}
