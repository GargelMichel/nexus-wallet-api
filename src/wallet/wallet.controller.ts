/**
 * Controller de Carteira
 * 
 * Endpoints disponíveis:
 * - GET /wallet/balance - Consultar saldo do usuário autenticado
 * - POST /wallet/withdraw - Realizar saque
 */

import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { WithdrawDto } from './dto/withdraw.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('wallet')
@ApiBearerAuth('JWT-auth') // Indica no Swagger que estas rotas requerem autenticação
@UseGuards(JwtAuthGuard) // Todas as rotas deste controller requerem autenticação
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Endpoint para consultar saldo
   * Retorna todas as carteiras do usuário autenticado
   */
  @Get('balance')
  @ApiOperation({ summary: 'Consultar saldo de todas as carteiras' })
  @ApiResponse({
    status: 200,
    description: 'Saldo consultado com sucesso',
    schema: {
      example: {
        wallets: [
          {
            currency: 'BTC',
            balance: '0.5',
            updatedAt: '2024-01-01T12:00:00.000Z',
          },
          {
            currency: 'ETH',
            balance: '2.3',
            updatedAt: '2024-01-01T12:00:00.000Z',
          },
        ],
        total: 2,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getBalance(@CurrentUser() user: any) {
    return this.walletService.getBalance(user.id);
  }

  /**
   * Endpoint para realizar saque
   */
  @Post('withdraw')
  @ApiOperation({ summary: 'Realizar saque de criptomoeda' })
  @ApiResponse({ status: 201, description: 'Saque realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Saldo insuficiente ou dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async withdraw(@CurrentUser() user: any, @Body() withdrawDto: WithdrawDto) {
    return this.walletService.withdraw(user.id, withdrawDto);
  }
}
