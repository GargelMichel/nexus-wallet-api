/**
 * Módulo de Carteira
 * 
 * Gerencia as funcionalidades relacionadas a carteiras de criptomoedas.
 */

import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { LedgerModule } from '../ledger/ledger.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, LedgerModule],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService], // Exporta para outros módulos (webhook, swap) usarem
})
export class WalletModule {}
