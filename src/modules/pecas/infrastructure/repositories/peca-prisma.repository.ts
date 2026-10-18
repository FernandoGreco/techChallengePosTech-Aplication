import { Injectable } from '@nestjs/common';
import { Peca } from '@prisma/client';
import { PrismaService } from '../../../../shared/database';
import { IPecaRepository } from '../../domain/repositories/peca.repository.interface';
import { CreatePecaDto } from '../../application/dto/create-peca.dto';

@Injectable()
export class PecaPrismaRepository implements IPecaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePecaDto): Promise<Peca> {
    return this.prisma.peca.create({ data });
  }

  async findAll(): Promise<Peca[]> {
    return this.prisma.peca.findMany();
  }

  async findById(id: string): Promise<Peca | null> {
    return this.prisma.peca.findUnique({ where: { id } });
  }

  async update(id: string, data: Partial<Peca>): Promise<Peca> {
    return this.prisma.peca.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.peca.delete({ where: { id } });
  }
}
