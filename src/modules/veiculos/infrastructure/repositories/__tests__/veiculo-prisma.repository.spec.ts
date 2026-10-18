import { VeiculoPrismaRepository } from '../veiculo-prisma.repository';

describe('VeiculoPrismaRepository', () => {
  const mockPrisma = {
    veiculo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as any;

  let repo: VeiculoPrismaRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new VeiculoPrismaRepository(mockPrisma);
  });

  it('create chama prisma.veiculo.create e retorna', async () => {
    const dto = { modelo: 'X' } as any;
    mockPrisma.veiculo.create.mockResolvedValue({ id: 'v1', ...dto });
    await expect(repo.create(dto)).resolves.toEqual({ id: 'v1', ...dto });
    expect(mockPrisma.veiculo.create).toHaveBeenCalledWith({ data: dto });
  });

  it('findAll chama prisma.veiculo.findMany e retorna lista', async () => {
    mockPrisma.veiculo.findMany.mockResolvedValue([{ id: 'v1' }]);
    await expect(repo.findAll()).resolves.toEqual([{ id: 'v1' }]);
    expect(mockPrisma.veiculo.findMany).toHaveBeenCalledWith({
      include: { cliente: true },
    });
  });

  it('findById chama prisma.veiculo.findUnique com id', async () => {
    mockPrisma.veiculo.findUnique.mockResolvedValue({ id: 'v1' });
    await expect(repo.findById('v1')).resolves.toEqual({ id: 'v1' });
    expect(mockPrisma.veiculo.findUnique).toHaveBeenCalledWith({
      where: { id: 'v1' },
      include: { cliente: true },
    });
  });

  it('findByClienteId chama prisma.veiculo.findMany com clienteId', async () => {
    mockPrisma.veiculo.findMany.mockResolvedValue([{ id: 'v1' }]);
    await expect(repo.findByClienteId('c1')).resolves.toEqual([{ id: 'v1' }]);
    expect(mockPrisma.veiculo.findMany).toHaveBeenCalledWith({
      where: { clienteId: 'c1' },
      include: { cliente: true },
    });
  });

  it('update chama prisma.veiculo.update com id e data', async () => {
    const dto = { modelo: 'Novo' } as any;
    mockPrisma.veiculo.update.mockResolvedValue({ id: 'v1', ...dto });
    await expect(repo.update('v1', dto)).resolves.toEqual({ id: 'v1', ...dto });
    expect(mockPrisma.veiculo.update).toHaveBeenCalledWith({
      where: { id: 'v1' },
      data: dto,
    });
  });

  it('delete chama prisma.veiculo.delete com id', async () => {
    mockPrisma.veiculo.delete.mockResolvedValue(undefined);
    await expect(repo.delete('v1')).resolves.toBeUndefined();
    expect(mockPrisma.veiculo.delete).toHaveBeenCalledWith({
      where: { id: 'v1' },
    });
  });
});
