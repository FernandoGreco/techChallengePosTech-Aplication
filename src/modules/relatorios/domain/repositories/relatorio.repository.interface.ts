export interface IOSFinalizadaTempo {
  id: string;
  numero: number;
  dataInicioExecucao: Date;
  dataFinalizacao: Date;
}

export const RELATORIO_REPOSITORY = 'RELATORIO_REPOSITORY';

export interface IRelatorioRepository {
  findOSFinalizadasComTempoExecucao(): Promise<IOSFinalizadaTempo[]>;
}
