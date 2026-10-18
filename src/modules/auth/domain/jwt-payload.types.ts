/**
 * Payload do JWT emitido pela Lambda (repo 1) para clientes — auth via CPF.
 * Contrato C1 (ver docs/rfc/RFC-003).
 */
export interface ILambdaJwtPayload {
  sub: string; // clienteId
  cpf: string;
  iss: 'lambda-auth';
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
  email?: string; // staff
  papel?: string; // staff
}
