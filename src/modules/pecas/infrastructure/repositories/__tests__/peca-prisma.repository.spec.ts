import { PecaPrismaRepository } from '../peca-prisma.repository';

describe('PecaPrismaRepository', () => {
  const mockPrisma = {
    peca: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as any;

  let repo: PecaPrismaRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new PecaPrismaRepository(mockPrisma);
  });

  it('create chama prisma.peca.create e retorna', async () => {
    const dto = { nome: 'Filtro' } as any;
    mockPrisma.peca.create.mockResolvedValue({ id: 'p1', ...dto });
    await expect(repo.create(dto)).resolves.toEqual({ id: 'p1', ...dto });
    expect(mockPrisma.peca.create).toHaveBeenCalledWith({ data: dto });
  });

  it('findAll chama prisma.peca.findMany e retorna lista', async () => {
    mockPrisma.peca.findMany.mockResolvedValue([{ id: 'p1' }]);
    await expect(repo.findAll()).resolves.toEqual([{ id: 'p1' }]);
    expect(mockPrisma.peca.findMany).toHaveBeenCalled();
  });

  it('findById chama prisma.peca.findUnique com id', async () => {
    mockPrisma.peca.findUnique.mockResolvedValue({ id: 'p1' });
    await expect(repo.findById('p1')).resolves.toEqual({ id: 'p1' });
    expect(mockPrisma.peca.findUnique).toHaveBeenCalledWith({
      where: { id: 'p1' },
    });
  });

  it('update chama prisma.peca.update com id e data', async () => {
    const dto = { nome: 'Novo' } as any;
    mockPrisma.peca.update.mockResolvedValue({ id: 'p1', ...dto });
    await expect(repo.update('p1', dto)).resolves.toEqual({ id: 'p1', ...dto });
    expect(mockPrisma.peca.update).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: dto,
    });
  });

  it('delete chama prisma.peca.delete com id', async () => {
    mockPrisma.peca.delete.mockResolvedValue(undefined);
    await expect(repo.delete('p1')).resolves.toBeUndefined();
    expect(mockPrisma.peca.delete).toHaveBeenCalledWith({
      where: { id: 'p1' },
    });
  });
});
