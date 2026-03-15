/**
 * Arquivo principal da aplicação NestJS
 * 
 * Este arquivo é o ponto de entrada da aplicação.
 * Aqui configuramos:
 * - Validações globais com class-validator
 * - Documentação Swagger/OpenAPI
 * - Segurança com Helmet
 * - CORS para permitir requisições de frontend
 * - Pipes de transformação e validação
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

async function bootstrap() {
  // Cria a instância da aplicação NestJS
  const app = await NestFactory.create(AppModule);

  // Configura o logger Winston (logs estruturados)
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Habilita CORS (Cross-Origin Resource Sharing)
  // Permite que frontends de outras origens acessem a API
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*', // Em produção, especifique os domínios permitidos
    credentials: true,
  });

  // Configura Helmet para segurança (adiciona headers de segurança HTTP)
  app.use(helmet());

  // Prefixo global para todas as rotas
  app.setGlobalPrefix('api');

  // Configura o ValidationPipe global
  // Este pipe valida automaticamente todos os DTOs que usam class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Transforma objetos em instâncias das classes DTO
      whitelist: true, // Remove propriedades que não estão no DTO
      forbidNonWhitelisted: true, // Lança erro se enviar propriedades não permitidas
      transformOptions: {
        enableImplicitConversion: true, // Converte tipos automaticamente (ex: string para number)
      },
    }),
  );

  // Configuração do Swagger (documentação automática da API)
  const config = new DocumentBuilder()
    .setTitle('Nexus Wallet API')
    .setDescription(
      'API REST para gerenciamento de carteira de criptomoedas com suporte a depósitos, saques e swap entre moedas.',
    )
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticação (registro, login, refresh token)')
    .addTag('wallet', 'Endpoints de carteira (saldo, saques)')
    .addTag('swap', 'Endpoints de troca de criptomoedas')
    .addTag('webhook', 'Endpoints para receber depósitos via webhook')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Informe o token JWT obtido no login',
        in: 'header',
      },
      'JWT-auth', // Nome da segurança no Swagger
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // Documentação disponível em /api/docs

  // Obtém a porta das variáveis de ambiente ou usa 3000 como padrão
  const port = process.env.PORT || 3000;

  await app.listen(port);

  console.log(`\n✅ Aplicação rodando em: http://localhost:${port}`);
  console.log(`📚 Documentação Swagger: http://localhost:${port}/api/docs\n`);
}

bootstrap();
