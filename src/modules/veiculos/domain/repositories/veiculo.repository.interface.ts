import { Veiculo } from '@prisma/client';
import { CreateVeiculoDto } from '../../application/dto/create-veiculo.dto';
import { UpdateVeiculoDto } from '../../application/dto/update-veiculo.dto';

export interface IVeiculoRepository {
  create(data: CreateVeiculoDto): Promise<Veiculo>;
  findAll(): Promise<Veiculo[]>;
  findById(id: string): Promise<Veiculo | null>;
  findByClienteId(clienteId: string): Promise<Veiculo[]>;
  update(id: string, data: UpdateVeiculoDto): Promise<Veiculo>;
  delete(id: string): Promise<void>;
}

export const VEICULO_REPOSITORY = 'VEICULO_REPOSITORY';
