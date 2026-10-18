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
import { PecasUseCase } from '../../application/use-cases/pecas.use-case';
import { CreatePecaDto } from '../../application/dto/create-peca.dto';
import { UpdatePecaDto } from '../../application/dto/update-peca.dto';
import {
  EntradaEstoqueDto,
  ReservarEstoqueDto,
  BaixarEstoqueDto,
} from '../../application/dto/estoque.dto';

@ApiTags('Peças / Insumos')
@ApiBearerAuth()
@Controller('pecas')
export class PecasController {
  constructor(private readonly pecasUseCase: PecasUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova peça/insumo' })
  @ApiResponse({ status: 201, description: 'Peça criada' })
  async criar(@Body() dto: CreatePecaDto) {
    return this.pecasUseCase.criar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as peças/insumos' })
  @ApiResponse({ status: 200, description: 'Lista de peças' })
  async listarTodas() {
    return this.pecasUseCase.listarTodas();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar peça por ID' })
  @ApiResponse({ status: 200, description: 'Peça encontrada' })
  @ApiResponse({ status: 404, description: 'Peça não encontrada' })
  async buscarPorId(@Param('id') id: string) {
    return this.pecasUseCase.buscarPorId(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar peça/insumo' })
  @ApiResponse({ status: 200, description: 'Peça atualizada' })
  async atualizar(@Param('id') id: string, @Body() dto: UpdatePecaDto) {
    return this.pecasUseCase.atualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover peça/insumo' })
  @ApiResponse({ status: 200, description: 'Peça removida' })
  async remover(@Param('id') id: string) {
    return this.pecasUseCase.remover(id);
  }

  @Post(':id/entrada-estoque')
  @ApiOperation({ summary: 'Registrar entrada de estoque' })
  @ApiResponse({ status: 200, description: 'Estoque atualizado' })
  async entradaEstoque(
    @Param('id') id: string,
    @Body() dto: EntradaEstoqueDto,
  ) {
    return this.pecasUseCase.entradaEstoque(id, dto.quantidade);
  }

  @Post(':id/reservar')
  @ApiOperation({ summary: 'Reservar peça do estoque' })
  @ApiResponse({ status: 200, description: 'Peça reservada' })
  @ApiResponse({ status: 422, description: 'Estoque insuficiente' })
  async reservar(@Param('id') id: string, @Body() dto: ReservarEstoqueDto) {
    return this.pecasUseCase.reservar(id, dto.quantidade);
  }

  @Post(':id/baixar-estoque')
  @ApiOperation({ summary: 'Baixar peça do estoque' })
  @ApiResponse({ status: 200, description: 'Estoque baixado' })
  @ApiResponse({ status: 422, description: 'Estoque insuficiente' })
  async baixarEstoque(@Param('id') id: string, @Body() dto: BaixarEstoqueDto) {
    return this.pecasUseCase.baixarEstoque(id, dto.quantidade);
  }
}
