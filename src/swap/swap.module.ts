/**
 * Módulo de Swap
 * 
 * Gerencia a troca de criptomoedas com integração ao CoinGecko.
 */

import { Module } from '@nestjs/common';
import { SwapController } from './swap.controller';
import { SwapService } from './swap.service';
import { CoinGeckoService } from './coingecko.service';
import { WalletModule } from '../wallet/wallet.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, WalletModule, ConfigModule],
  controllers: [SwapController],
  providers: [SwapService, CoinGeckoService],
})
export class SwapModule {}
