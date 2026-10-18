import { PrismaService } from '../prisma.service';

describe('PrismaService', () => {
  it('onModuleInit chama $connect', async () => {
    const svc = new PrismaService();
    svc.$connect = jest.fn().mockResolvedValue(undefined);
    await svc.onModuleInit();
    expect(svc.$connect).toHaveBeenCalled();
  });

  it('onModuleDestroy chama $disconnect', async () => {
    const svc = new PrismaService();
    svc.$disconnect = jest.fn().mockResolvedValue(undefined);
    await svc.onModuleDestroy();
    expect(svc.$disconnect).toHaveBeenCalled();
  });
});
