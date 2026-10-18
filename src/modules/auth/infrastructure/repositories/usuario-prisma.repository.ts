import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database';
import {
  IUsuarioRepository,
  IUsuario,
} from '../../domain/repositories/usuario.repository.interface';

@Injectable()
export class UsuarioPrismaRepository implements IUsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<IUsuario | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email },
      select: { id: true, email: true, senhaHash: true, papel: true },
    });
    return usuario ?? null;
  }
}
