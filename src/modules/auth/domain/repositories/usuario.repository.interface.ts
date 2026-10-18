export interface IUsuario {
  id: string;
  email: string;
  senhaHash: string;
  papel: string;
}

export const USUARIO_REPOSITORY = 'USUARIO_REPOSITORY';

export interface IUsuarioRepository {
  findByEmail(email: string): Promise<IUsuario | null>;
}
