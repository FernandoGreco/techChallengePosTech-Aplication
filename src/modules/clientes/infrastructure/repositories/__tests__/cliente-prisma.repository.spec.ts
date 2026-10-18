import { ClientePrismaRepository } from '../cliente-prisma.repository';

describe('ClientePrismaRepository', () => {
  const mockPrisma = {
    cliente: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  } as any;

  let repo: ClientePrismaRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new ClientePrismaRepository(mockPrisma);
  });

  it('create chama prisma.cliente.create e retorna cliente', async () => {
    const dto = { nome: 'A' } as any;
    mockPrisma.cliente.create.mockResolvedValue({ id: '1', ...dto });
    await expect(repo.create(dto)).resolves.toEqual({ id: '1', ...dto });
    expect(mockPrisma.cliente.create).toHaveBeenCalledWith({ data: dto });
  });

  it('findAll chama prisma.cliente.findMany e retorna lista', async () => {
    mockPrisma.cliente.findMany.mockResolvedValue([{ id: '1' }]);
    await expect(repo.findAll()).resolves.toEqual([{ id: '1' }]);
    expect(mockPrisma.cliente.findMany).toHaveBeenCalledWith({
      include: { veiculos: true },
    });
  });

  it('findById chama prisma.cliente.findUnique com where id', async () => {
    mockPrisma.cliente.findUnique.mockResolvedValue({ id: '1' });
    await expect(repo.findById('1')).resolves.toEqual({ id: '1' });
    expect(mockPrisma.cliente.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: { veiculos: true },
    });
  });

  it('findByDocumento chama prisma.cliente.findUnique com where documento', async () => {
    mockPrisma.cliente.findUnique.mockResolvedValue({ id: '1' });
    await expect(repo.findByDocumento('doc')).resolves.toEqual({ id: '1' });
    expect(mockPrisma.cliente.findUnique).toHaveBeenCalledWith({
      where: { documento: 'doc' },
      include: { veiculos: true },
    });
  });

  it('update chama prisma.cliente.update com id e data', async () => {
    const dto = { nome: 'B' } as any;
    mockPrisma.cliente.update.mockResolvedValue({ id: '1', ...dto });
    await expect(repo.update('1', dto)).resolves.toEqual({ id: '1', ...dto });
    expect(mockPrisma.cliente.update).toHaveBeenCalledWith({
      where: { id: '1' },
      data: dto,
    });
  });

  it('delete chama prisma.cliente.delete com id', async () => {
    mockPrisma.cliente.delete.mockResolvedValue(undefined);
    await expect(repo.delete('1')).resolves.toBeUndefined();
    expect(mockPrisma.cliente.delete).toHaveBeenCalledWith({
      where: { id: '1' },
    });
  });
});
