/**
 * Serviço do Prisma
 * 
 * Gerencia a conexão com o banco de dados PostgreSQL.
 * 
 * Este serviço:
 * - Conecta ao banco quando a aplicação inicia
 * - Desconecta quando a aplicação é encerrada (evita conexões abertas)
 * - Disponibiliza o cliente Prisma para todos os módulos
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  /**
   * Conecta ao banco de dados quando o módulo é inicializado
   */
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Conexão com o banco de dados estabelecida com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao conectar com o banco de dados', error);
      throw error;
    }
  }

  /**
   * Desconecta do banco de dados quando o módulo é destruído
   * Importante para evitar conexões abertas ao encerrar a aplicação
   */
  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 Conexão com o banco de dados encerrada');
  }
}
