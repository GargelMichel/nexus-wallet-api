/**
 * Serviço de Webhook
 * 
 * Processa depósitos recebidos via webhook externo.
 * 
 * Implementa idempotência:
 * - Mesmo depósito não é processado duas vezes
 * - Usa externalId para identificar depósitos únicos
 */

import { Injectable, BadRequestException, Logger, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WalletService } from '../wallet/wallet.service';
import { TransactionType } from '../ledger/ledger.service';
import { DepositDto } from './dto/deposit.dto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  /**
   * Processa um depósito recebido via webhook
   * 
   * Implementa idempotência:
   * - Verifica se o externalId já foi processado
   * - Se sim, retorna o depósito existente sem duplicar
   * 
   * @param depositDto - Dados do depósito
   * @returns Resultado do processamento
   */
  async processDeposit(depositDto: DepositDto) {
    const { userEmail, currency, amount, externalId } = depositDto;

    // Busca o usuário pelo email
    const user = await this.prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      this.logger.warn(`Depósito recebido para usuário inexistente: ${userEmail}`);
      throw new BadRequestException('Usuário não encontrado');
    }

    // IDEMPOTÊNCIA: Verifica se o depósito já foi processado
    const existingDeposit = await this.prisma.deposit.findUnique({
      where: { externalId },
    });

    if (existingDeposit) {
      this.logger.warn(
        `Tentativa de processar depósito duplicado: ${externalId} - Status: ${existingDeposit.status}`,
      );

      // Se já foi processado, retorna o existente
      if (existingDeposit.status === 'PROCESSED') {
        return {
          message: 'Depósito já processado anteriormente (idempotência)',
          deposit: existingDeposit,
          duplicated: true,
        };
      }

      // Se está pendente, tenta processar novamente
      if (existingDeposit.status === 'PENDING') {
        return this.completeDeposit(existingDeposit.id, user.id, currency, amount);
      }

      // Se falhou antes, não processa novamente
      throw new ConflictException('Depósito anterior falhou. Entre em contato com o suporte.');
    }

    // Cria o registro do depósito com status PENDING
    const deposit = await this.prisma.deposit.create({
      data: {
        userId: user.id,
        externalId,
        currency: currency.toUpperCase(),
        amount,
        status: 'PENDING',
      },
    });

    this.logger.log(
      `Depósito criado: ${amount} ${currency} para ${userEmail} - ExternalId: ${externalId}`,
    );

    // Processa o depósito (adiciona saldo)
    return this.completeDeposit(deposit.id, user.id, currency, amount);
  }

  /**
   * Completa o processamento do depósito
   * Adiciona o saldo à carteira e marca como PROCESSED
   * 
   * @param depositId - ID do depósito
   * @param userId - ID do usuário
   * @param currency - Moeda
   * @param amount - Quantidade
   * @returns Resultado
   */
  private async completeDeposit(
    depositId: string,
    userId: string,
    currency: string,
    amount: number,
  ) {
    try {
      // Adiciona o saldo à carteira do usuário
      await this.walletService.addBalance(userId, currency, amount, TransactionType.DEPOSIT, {
        depositId,
        timestamp: new Date().toISOString(),
      });

      // Marca o depósito como processado
      const processedDeposit = await this.prisma.deposit.update({
        where: { id: depositId },
        data: {
          status: 'PROCESSED',
          processedAt: new Date(),
        },
      });

      this.logger.log(
        `Depósito processado com sucesso: ${amount} ${currency} - DepositId: ${depositId}`,
      );

      return {
        message: 'Depósito processado com sucesso',
        deposit: processedDeposit,
      };
    } catch (error) {
      // Em caso de erro, marca como FAILED
      await this.prisma.deposit.update({
        where: { id: depositId },
        data: { status: 'FAILED' },
      });

      this.logger.error(`Erro ao processar depósito ${depositId}`, error.stack);
      throw error;
    }
  }

  /**
   * Consulta o histórico de depósitos de um usuário
   * 
   * @param userId - ID do usuário
   * @returns Lista de depósitos
   */
  async getDepositHistory(userId: string) {
    const deposits = await this.prisma.deposit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Últimos 50 depósitos
    });

    return {
      deposits,
      total: deposits.length,
    };
  }
}
