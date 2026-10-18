// Deve ser a PRIMEIRA importação: inicializa o agente Datadog (dd-trace)
// antes de qualquer outro módulo para capturar toda a instrumentação.
import './tracing';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Oficina Mecânica API')
    .setDescription(
      'API do sistema de gestão para oficina mecânica - MVP acadêmico',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Aplicação rodando na porta ${port}`);
  console.log(`Swagger disponível em http://localhost:${port}/api/docs`);
}

if (require.main === module) {
  void bootstrap();
}
