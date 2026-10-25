/**
 * Payload do JWT emitido pela Lambda (repo 1) para clientes — auth via CPF.
 * Contrato C1 alinhado com docs/auth-contract.md do repo 1.
 */
export interface ILambdaJwtPayload {
  sub: string; // clienteId
  cpf: string;
  nome?: string; // opcional, vindo da Lambda
  papel?: string; // opcional, vindo da Lambda (sempre 'CLIENTE')
  iss: 'oficina-auth-lambda';
  iat: number;
  exp: number;
}

/**
 * Payload do JWT emitido internamente pelo app para staff
 * (ADMIN, ATENDENTE, MECANICO) — login email+senha.
 */
export interface IStaffJwtPayload {
  sub: string; // usuarioId
  email: string;
  papel: string;
  iss: 'oficina-staff';
  iat: number;
  exp: number;
}

export type IJwtPayload = ILambdaJwtPayload | IStaffJwtPayload;

/**
 * Usuário autenticado exposto no request (request.user).
 * Unifica os dois emissores em um shape único.
 */
export interface IAuthenticatedUser {
  id: string;
  tipo: 'cliente' | 'staff';
  cpf?: string; // cliente
  nome?: string; // cliente (opcional, da Lambda)
  email?: string; // staff
  papel?: string; // staff
}
