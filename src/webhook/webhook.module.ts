/**
 * Módulo de Webhook
 * 
 * Gerencia o recebimento de depósitos via webhook.
 */

import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { WalletModule } from '../wallet/wallet.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, WalletModule],
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
