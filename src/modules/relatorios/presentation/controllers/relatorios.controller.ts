import { Controller, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TempoMedioServicosUseCase } from '../../application/use-cases/tempo-medio-servicos.use-case';

@ApiTags('Relatórios')
@ApiBearerAuth()
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly tempoMedioServicos: TempoMedioServicosUseCase) {}

  @Get('tempo-medio-servicos')
  @ApiOperation({ summary: 'Relatório de tempo médio de execução das OS' })
  @ApiResponse({
    status: 200,
    description: 'Tempo médio de execução dos serviços',
  })
  tempoMedio() {
    return this.tempoMedioServicos.execute();
  }
}
