import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VeiculosUseCase } from '../../application/use-cases/veiculos.use-case';
import { CreateVeiculoDto } from '../../application/dto/create-veiculo.dto';
import { UpdateVeiculoDto } from '../../application/dto/update-veiculo.dto';

@ApiTags('Veículos')
@ApiBearerAuth()
@Controller()
export class VeiculosController {
  constructor(private readonly veiculosUseCase: VeiculosUseCase) {}

  @Post('veiculos')
  @ApiOperation({ summary: 'Criar novo veículo' })
  @ApiResponse({ status: 201, description: 'Veículo criado' })
  async criar(@Body() dto: CreateVeiculoDto) {
    return this.veiculosUseCase.criar(dto);
  }

  @Get('veiculos')
  @ApiOperation({ summary: 'Listar todos os veículos' })
  @ApiResponse({ status: 200, description: 'Lista de veículos' })
  async listarTodos() {
    return this.veiculosUseCase.listarTodos();
  }

  @Get('veiculos/:id')
  @ApiOperation({ summary: 'Buscar veículo por ID' })
  @ApiResponse({ status: 200, description: 'Veículo encontrado' })
  @ApiResponse({ status: 404, description: 'Veículo não encontrado' })
  async buscarPorId(@Param('id') id: string) {
    return this.veiculosUseCase.buscarPorId(id);
  }

  @Get('clientes/:clienteId/veiculos')
  @ApiOperation({ summary: 'Listar veículos de um cliente' })
  @ApiResponse({ status: 200, description: 'Lista de veículos do cliente' })
  async buscarPorClienteId(@Param('clienteId') clienteId: string) {
    return this.veiculosUseCase.buscarPorClienteId(clienteId);
  }

  @Put('veiculos/:id')
  @ApiOperation({ summary: 'Atualizar veículo' })
  @ApiResponse({ status: 200, description: 'Veículo atualizado' })
  async atualizar(@Param('id') id: string, @Body() dto: UpdateVeiculoDto) {
    return this.veiculosUseCase.atualizar(id, dto);
  }

  @Delete('veiculos/:id')
  @ApiOperation({ summary: 'Remover veículo' })
  @ApiResponse({ status: 200, description: 'Veículo removido' })
  async remover(@Param('id') id: string) {
    return this.veiculosUseCase.remover(id);
  }
}
