import { Peca } from '@prisma/client';
import { CreatePecaDto } from '../../application/dto/create-peca.dto';

export interface IPecaRepository {
  create(data: CreatePecaDto): Promise<Peca>;
  findAll(): Promise<Peca[]>;
  findById(id: string): Promise<Peca | null>;
  update(id: string, data: Partial<Peca>): Promise<Peca>;
  delete(id: string): Promise<void>;
}

export const PECA_REPOSITORY = 'PECA_REPOSITORY';
