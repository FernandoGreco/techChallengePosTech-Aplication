import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from '../login.use-case';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  const mockUsuarioRepository = { findByEmail: jest.fn() };
  const mockJwtService = { sign: jest.fn() };

  beforeEach(() => {
    useCase = new LoginUseCase(mockUsuarioRepository, mockJwtService as any);
    jest.clearAllMocks();
  });

  it('deve retornar token quando credenciais são válidas', async () => {
    const senhaHash = await bcrypt.hash('senha123', 10);
    mockUsuarioRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'admin@test.com',
      papel: 'ADMIN',
      senhaHash,
    });
    mockJwtService.sign.mockReturnValue('token-123');

    const result = await useCase.execute({
      email: 'admin@test.com',
      senha: 'senha123',
    });

    expect(result).toEqual({ accessToken: 'token-123' });
    expect(mockJwtService.sign).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'admin@test.com',
      papel: 'ADMIN',
    });
  });

  it('deve rejeitar quando usuário não existe', async () => {
    mockUsuarioRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'admin@test.com', senha: 'senha123' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('deve rejeitar quando senha é inválida', async () => {
    const senhaHash = await bcrypt.hash('senha123', 10);
    mockUsuarioRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'admin@test.com',
      papel: 'ADMIN',
      senhaHash,
    });

    await expect(
      useCase.execute({ email: 'admin@test.com', senha: 'senhaErrada' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
