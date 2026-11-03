import { randomUUID } from 'crypto';

/**
 * Extrai ou gera o correlation-id da requisição.
 * Prioriza o header `x-correlation-id` propagado pelo API Gateway;
 * se ausente, gera um UUID novo.
 */
export function extractOrGenerateCorrelationId(headers: {
  [key: string]: unknown;
}): string {
  const header = headers['x-correlation-id'];
  if (typeof header === 'string' && header.length > 0) {
    return header;
  }
  return randomUUID();
}
