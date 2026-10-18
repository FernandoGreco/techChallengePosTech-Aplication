import { ServicoPrismaRepository } from '../servico-prisma.repository';

describe('ServicoPrismaRepository', () => {
  const mockPrisma = {
    servico: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as any;

  let repo: ServicoPrismaRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new ServicoPrismaRepository(mockPrisma);
  });

  it('create chama prisma.servico.create e retorna', async () => {
    const dto = { nome: 'S' } as any;
    mockPrisma.servico.create.mockResolvedValue({ id: 's1', ...dto });
    await expect(repo.create(dto)).resolves.toEqual({ id: 's1', ...dto });
    expect(mockPrisma.servico.create).toHaveBeenCalledWith({ data: dto });
  });

  it('findAll chama prisma.servico.findMany e retorna lista', async () => {
    mockPrisma.servico.findMany.mockResolvedValue([{ id: 's1' }]);
    await expect(repo.findAll()).resolves.toEqual([{ id: 's1' }]);
    expect(mockPrisma.servico.findMany).toHaveBeenCalled();
  });

  it('findById chama prisma.servico.findUnique com id', async () => {
    mockPrisma.servico.findUnique.mockResolvedValue({ id: 's1' });
    await expect(repo.findById('s1')).resolves.toEqual({ id: 's1' });
    expect(mockPrisma.servico.findUnique).toHaveBeenCalledWith({
      where: { id: 's1' },
    });
  });

  it('update chama prisma.servico.update com id e data', async () => {
    const dto = { nome: 'Novo' } as any;
    mockPrisma.servico.update.mockResolvedValue({ id: 's1', ...dto });
    await expect(repo.update('s1', dto)).resolves.toEqual({ id: 's1', ...dto });
    expect(mockPrisma.servico.update).toHaveBeenCalledWith({
      where: { id: 's1' },
      data: dto,
    });
  });

  it('delete chama prisma.servico.delete com id', async () => {
    mockPrisma.servico.delete.mockResolvedValue(undefined);
    await expect(repo.delete('s1')).resolves.toBeUndefined();
    expect(mockPrisma.servico.delete).toHaveBeenCalledWith({
      where: { id: 's1' },
    });
  });
});
