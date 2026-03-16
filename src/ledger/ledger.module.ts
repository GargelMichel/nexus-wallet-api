/**
 * Módulo de Ledger
 * 
 * Fornece serviços de registro e consulta do livro-razão.
 */

import { Module } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [LedgerService],
  exports: [LedgerService], // Exporta para outros módulos usarem
})
export class LedgerModule {}
