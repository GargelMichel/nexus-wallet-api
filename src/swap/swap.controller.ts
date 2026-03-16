/**
 * Controller de Swap
 * 
 * Endpoints disponíveis:
 * - POST /swap - Realizar swap entre duas criptomoedas
 * - POST /swap/preview - Simular swap (preview)
 * - GET /swap/currencies - Listar moedas suportadas
 */

import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SwapService } from './swap.service';
import { CoinGeckoService } from './coingecko.service';
import { SwapDto } from './dto/swap.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('swap')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('swap')
export class SwapController {
  constructor(
    private readonly swapService: SwapService,
    private readonly coinGeckoService: CoinGeckoService,
  ) {}

  /**
   * Endpoint para realizar swap
   */
  @Post()
  @ApiOperation({
    summary: 'Realizar swap entre criptomoedas',
    description:
      'Troca uma criptomoeda por outra usando cotações em tempo real. Taxa de 1,5% aplicada.',
  })
  @ApiResponse({ status: 201, description: 'Swap realizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Saldo insuficiente ou dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async swap(@CurrentUser() user: any, @Body() swapDto: SwapDto) {
    return this.swapService.performSwap(user.id, swapDto);
  }

  /**
   * Endpoint para simular swap (preview)
   */
  @Post('preview')
  @ApiOperation({
    summary: 'Simular swap (preview)',
    description:
      'Mostra quanto o usuário receberá sem executar o swap. Útil para exibir antes de confirmar.',
  })
  @ApiResponse({ status: 200, description: 'Simulação realizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async previewSwap(@Body() swapDto: SwapDto) {
    return this.swapService.previewSwap(swapDto);
  }

  /**
   * Endpoint para listar moedas suportadas
   */
  @Get('currencies')
  @ApiOperation({
    summary: 'Listar criptomoedas suportadas',
    description: 'Retorna a lista de criptomoedas disponíveis para swap.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de moedas',
    schema: {
      example: {
        currencies: ['BTC', 'ETH', 'USDT', 'BNB', 'USDC', 'XRP', 'ADA', 'DOGE', 'SOL'],
      },
    },
  })
  getSupportedCurrencies() {
    return {
      currencies: this.coinGeckoService.getSupportedCurrencies(),
    };
  }
}
