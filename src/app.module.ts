/**
 * Módulo principal da aplicação
 * 
 * Importa e configura todos os módulos, providers e middlewares globais:
 * - ConfigModule: Carrega variáveis de ambiente do .env
 * - WinstonModule: Logs estruturados
 * - ThrottlerModule: Rate limiting (proteção contra abuso)
 * - PrismaModule: Conexão com banco de dados
 * - Módulos de funcionalidade (Auth, Wallet, Ledger, Swap, Webhook)
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

// Módulos personalizados
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { LedgerModule } from './ledger/ledger.module';
import { SwapModule } from './swap/swap.module';
import { WebhookModule } from './webhook/webhook.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [
    // Configuração de variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true, // Torna as variáveis acessíveis em todos os módulos
      envFilePath: '.env',
    }),

    // Configuração de logs com Winston
    WinstonModule.forRoot({
      transports: [
        // Console: logs coloridos para desenvolvimento
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.colorize({ all: true }),
            winston.format.printf(({ timestamp, level, message, context, trace }) => {
              return `${timestamp} [${context || 'Application'}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
            }),
          ),
        }),
        // Arquivo: logs em JSON para produção (facilita parsing)
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
      ],
    }),

    // Rate Limiting (limita número de requisições por IP)
    // Proteção contra abuso e ataques de força bruta
    ThrottlerModule.forRoot([{
      ttl: parseInt(process.env.THROTTLE_TTL) || 60000, // Janela de tempo (60 segundos)
      limit: parseInt(process.env.THROTTLE_LIMIT) || 100, // Máximo de requisições
    }]),

    // Módulos da aplicação
    PrismaModule,
    AuthModule,
    WalletModule,
    LedgerModule,
    SwapModule,
    WebhookModule,
  ],
  providers: [
    // Aplicar ThrottlerGuard globalmente em todas as rotas
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Filtro global de exceções (tratamento de erros centralizado)
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
