import { extractOrGenerateCorrelationId } from '../../../../src/shared/logging/correlation-id.util';

describe('extractOrGenerateCorrelationId', () => {
  it('reutiliza o x-correlation-id vindo do API Gateway', () => {
    const id = extractOrGenerateCorrelationId({
      'x-correlation-id': 'abc-123',
    });
    expect(id).toBe('abc-123');
  });

  it('gera um UUID quando o header está ausente', () => {
    const id = extractOrGenerateCorrelationId({});
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('gera um UUID quando o header está vazio', () => {
    const id = extractOrGenerateCorrelationId({ 'x-correlation-id': '' });
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('gera UUIDs distintos em chamadas consecutivas', () => {
    const a = extractOrGenerateCorrelationId({});
    const b = extractOrGenerateCorrelationId({});
    expect(a).not.toBe(b);
  });
});
