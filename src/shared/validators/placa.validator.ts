export function isValidPlaca(placa: string): boolean {
  const placaAntiga = /^[A-Z]{3}-?\d{4}$/;
  const placaMercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/;
  const upper = placa.toUpperCase();
  return placaAntiga.test(upper) || placaMercosul.test(upper);
}
