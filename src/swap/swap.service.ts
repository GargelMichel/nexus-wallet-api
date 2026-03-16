/**
 * Serviço de Swap (Troca de Criptomoedas)
 * 
 * Realiza a troca entre duas criptomoedas:
 * 1. Obtém a cotação atual via CoinGecko
 * 2. Calcula o valor a receber (menos a taxa de 1,5%)
 * 3. Debita da carteira de origem
 * 4. Credita na carteira de destino
 * 5. Registra todas as operações no ledger
 */

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WalletService } from '../wallet/wallet.service';
import { TransactionType } from '../ledger/ledger.service';
import { CoinGeckoService } from './coingecko.service';
import { SwapDto } from './dto/swap.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SwapService {
  private readonly logger = new Logger(SwapService.name);
  private readonly swapFeePercentage: number;

  constructor(
    private walletService: WalletService,
    private coinGeckoService: CoinGeckoService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // Obtém a taxa de swap das variáveis de ambiente (padrão: 1.5%)
    this.swapFeePercentage =
      parseFloat(this.configService.get<string>('SWAP_FEE_PERCENTAGE')) || 1.5;
  }

  /**
   * Realiza uma troca entre duas criptomoedas
   * 
   * @param userId - ID do usuário
   * @param swapDto - Dados do swap
   * @returns Resultado da operação
   */
  async performSwap(userId: string, swapDto: SwapDto) {
    const { fromCurrency, toCurrency, amount } = swapDto;

    // Validações básicas
    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
      throw new BadRequestException('As moedas de origem e destino devem ser diferentes');
    }

    // Verifica se o usuário tem saldo suficiente
    const fromWallet = await this.walletService.getOrCreateWallet(userId, fromCurrency);
    const currentBalance = new Decimal(fromWallet.balance.toString());
    const swapAmount = new Decimal(amount.toString());

    if (currentBalance.lessThan(swapAmount)) {
      throw new BadRequestException(
        `Saldo insuficiente em ${fromCurrency}. Saldo atual: ${currentBalance.toString()}`,
      );
    }

    // Obtém a taxa de conversão atual
    const conversionRate = await this.coinGeckoService.getConversionRate(
      fromCurrency,
      toCurrency,
    );

    // Calcula o valor bruto a receber (sem taxa)
    const grossAmount = swapAmount.times(conversionRate);

    // Calcula a taxa (1,5% sobre o valor bruto)
    const feeAmount = grossAmount.times(this.swapFeePercentage / 100);

    // Calcula o valor líquido a receber (após taxa)
    const netAmount = grossAmount.minus(feeAmount);

    this.logger.log(
      `Swap: ${swapAmount} ${fromCurrency} -> ${grossAmount} ${toCurrency} (taxa: ${feeAmount}, líquido: ${netAmount})`,
    );

    // Executa o swap em uma transação atômica do banco
    const swapId = `swap-${Date.now()}-${userId}`;

    try {
      await this.prisma.$transaction(async (tx) => {
        // 1. Remove da carteira de origem (SWAP_OUT)
        const fromWalletBalance = new Decimal(fromWallet.balance.toString());
        const newFromBalance = fromWalletBalance.minus(swapAmount);

        await tx.wallet.update({
          where: { id: fromWallet.id },
          data: { balance: newFromBalance },
        });

        await tx.ledgerEntry.create({
          data: {
            userId,
            transactionType: TransactionType.SWAP_OUT,
            currency: fromCurrency.toUpperCase(),
            amount: swapAmount.negated(),
            balanceBefore: fromWalletBalance,
            balanceAfter: newFromBalance,
            metadata: {
              swapId,
              toCurrency: toCurrency.toUpperCase(),
              conversionRate: conversionRate.toString(),
            },
          },
        });

        // 2. Registra a taxa cobrada (FEE)
        await tx.ledgerEntry.create({
          data: {
            userId,
            transactionType: TransactionType.FEE,
            currency: toCurrency.toUpperCase(),
            amount: feeAmount.negated(),
            balanceBefore: new Decimal(0), // Taxa não afeta saldo diretamente
            balanceAfter: new Decimal(0),
            metadata: {
              swapId,
              feePercentage: this.swapFeePercentage,
              fromCurrency: fromCurrency.toUpperCase(),
            },
          },
        });

        // 3. Adiciona à carteira de destino (SWAP_IN)
        const toWallet = await this.walletService.getOrCreateWallet(userId, toCurrency);
        const toWalletBalance = new Decimal(toWallet.balance.toString());
        const newToBalance = toWalletBalance.plus(netAmount);

        await tx.wallet.update({
          where: { id: toWallet.id },
          data: { balance: newToBalance },
        });

        await tx.ledgerEntry.create({
          data: {
            userId,
            transactionType: TransactionType.SWAP_IN,
            currency: toCurrency.toUpperCase(),
            amount: netAmount,
            balanceBefore: toWalletBalance,
            balanceAfter: newToBalance,
            metadata: {
              swapId,
              fromCurrency: fromCurrency.toUpperCase(),
              conversionRate: conversionRate.toString(),
              feeAmount: feeAmount.toString(),
            },
          },
        });
      });

      this.logger.log(`Swap concluído com sucesso: ${swapId}`);

      return {
        message: 'Swap realizado com sucesso',
        swap: {
          swapId,
          from: {
            currency: fromCurrency.toUpperCase(),
            amount: swapAmount.toString(),
          },
          to: {
            currency: toCurrency.toUpperCase(),
            grossAmount: grossAmount.toString(),
            netAmount: netAmount.toString(),
          },
          fee: {
            amount: feeAmount.toString(),
            percentage: this.swapFeePercentage,
          },
          conversionRate: conversionRate.toString(),
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Erro ao executar swap ${swapId}`, error.stack);
      throw new BadRequestException('Erro ao processar swap. Tente novamente.');
    }
  }

  /**
   * Simula um swap sem executá-lo (preview)
   * Útil para mostrar ao usuário quanto ele receberá
   * 
   * @param swapDto - Dados do swap
   * @returns Simulação do resultado
   */
  async previewSwap(swapDto: SwapDto) {
    const { fromCurrency, toCurrency, amount } = swapDto;

    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
      throw new BadRequestException('As moedas devem ser diferentes');
    }

    const conversionRate = await this.coinGeckoService.getConversionRate(
      fromCurrency,
      toCurrency,
    );

    const swapAmount = new Decimal(amount.toString());
    const grossAmount = swapAmount.times(conversionRate);
    const feeAmount = grossAmount.times(this.swapFeePercentage / 100);
    const netAmount = grossAmount.minus(feeAmount);

    return {
      from: {
        currency: fromCurrency.toUpperCase(),
        amount: swapAmount.toString(),
      },
      to: {
        currency: toCurrency.toUpperCase(),
        grossAmount: grossAmount.toString(),
        netAmount: netAmount.toString(),
      },
      fee: {
        amount: feeAmount.toString(),
        percentage: this.swapFeePercentage,
      },
      conversionRate: conversionRate.toString(),
      disclaimer: 'Esta é uma simulação. A cotação pode variar no momento da execução.',
    };
  }
}
