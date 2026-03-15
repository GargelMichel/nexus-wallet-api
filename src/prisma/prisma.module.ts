/**
 * Módulo do Prisma
 * 
 * Exporta o PrismaService para ser usado em outros módulos.
 * Configurado como global para evitar importações repetidas.
 */

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Torna o módulo global - disponível em toda a aplicação sem precisar importar
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Exporta para outros módulos usarem
})
export class PrismaModule {}
