/**
 * Controller de Webhook
 * 
 * Endpoints disponíveis:
 * - POST /webhook/deposit - Receber notificação de depósito
 * 
 * Nota: Em produção, adicione autenticação específica para webhooks
 * (ex: validação de assinatura, IP whitelist, API key)
 */

import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebhookService } from './webhook.service';
import { DepositDto } from './dto/deposit.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('webhook')
@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  /**
   * Endpoint para receber notificações de depósito
   * 
   * Este endpoint é chamado por sistemas externos quando um depósito é detectado.
   * Implementa idempotência: o mesmo depósito não é processado duas vezes.
   */
  @Public() // Webhook não usa JWT (mas deve ter outra forma de autenticação em produção)
  @Post('deposit')
  @ApiOperation({
    summary: 'Receber notificação de depósito',
    description:
      'Endpoint para sistemas externos notificarem depósitos. Implementa idempotência via externalId.',
  })
  @ApiResponse({ status: 201, description: 'Depósito processado com sucesso' })
  @ApiResponse({
    status: 200,
    description: 'Depósito já processado anteriormente (idempotência)',
  })
  @ApiResponse({ status: 400, description: 'Usuário não encontrado ou dados inválidos' })
  @ApiResponse({ status: 409, description: 'Depósito anterior falhou' })
  async receiveDeposit(@Body() depositDto: DepositDto) {
    return this.webhookService.processDeposit(depositDto);
  }
}
