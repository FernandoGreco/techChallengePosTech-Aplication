import { UsuarioPrismaRepository } from '../usuario-prisma.repository';

const mockPrisma = {
  usuario: { findUnique: jest.fn() },
};

describe('UsuarioPrismaRepository', () => {
  let repository: UsuarioPrismaRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new UsuarioPrismaRepository(mockPrisma as any);
  });

  it('deve retornar usuario quando email existe', async () => {
    const usuario = {
      id: 'u1',
      email: 'admin@test.com',
      senhaHash: '$2b$10$hash',
      papel: 'ADMIN',
    };
    mockPrisma.usuario.findUnique.mockResolvedValue(usuario);

    const result = await repository.findByEmail('admin@test.com');

    expect(result).toEqual(usuario);
    expect(mockPrisma.usuario.findUnique).toHaveBeenCalledWith({
      where: { email: 'admin@test.com' },
      select: { id: true, email: true, senhaHash: true, papel: true },
    });
  });

  it('deve retornar null quando email não existe', async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue(null);

    const result = await repository.findByEmail('naoexiste@test.com');

    expect(result).toBeNull();
  });

  it('deve buscar apenas os campos necessários (sem senha em plain text)', async () => {
    mockPrisma.usuario.findUnique.mockResolvedValue(null);

    await repository.findByEmail('test@test.com');

    const callArgs = mockPrisma.usuario.findUnique.mock.calls[0][0];
    expect(callArgs.select).toEqual({
      id: true,
      email: true,
      senhaHash: true,
      papel: true,
    });
    expect(callArgs.select.nome).toBeUndefined();
    expect(callArgs.select.createdAt).toBeUndefined();
  });
});
