import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '../../shared/database';
import { AuthController } from './presentation/controllers/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { USUARIO_REPOSITORY } from './domain/repositories/usuario.repository.interface';
import { UsuarioPrismaRepository } from './infrastructure/repositories/usuario-prisma.repository';

@Module({
  imports: [
    DatabaseModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'oficina-mecanica-jwt-secret-dev',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      } as Record<string, unknown>,
    }),
  ],
  controllers: [AuthController],
  providers: [
    { provide: USUARIO_REPOSITORY, useClass: UsuarioPrismaRepository },
    LoginUseCase,
    JwtStrategy,
  ],
  exports: [JwtModule],
})
export class AuthModule {}
