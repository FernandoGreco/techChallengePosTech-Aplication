import { AuthController } from '../controllers/auth.controller';

describe('AuthController', () => {
  it('deve chamar LoginUseCase e retornar token', async () => {
    const loginUseCase = {
      execute: jest.fn().mockResolvedValue({ accessToken: 'jwt-token' }),
    };
    const controller = new AuthController(loginUseCase as any);
    const dto = { email: 'teste@exemplo.com', senha: 'senha123' };

    const result = await controller.login(dto);

    expect(result).toEqual({ accessToken: 'jwt-token' });
    expect(loginUseCase.execute).toHaveBeenCalledWith(dto);
  });
});
