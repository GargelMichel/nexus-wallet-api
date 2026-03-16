/**
 * Serviço de Carteira
 * 
 * Gerencia as carteiras de criptomoedas dos usuários:
 * - Consultar saldo
 * - Realizar saques
 * - Atualizar saldo (usado internamente por outros módulos)
 */

import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LedgerService, TransactionType } from '../ledger/ledger.service';
import { Decimal } from '@prisma/client/runtime/library';
import { WithdrawDto } from './dto/withdraw.dto';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private prisma: PrismaService,
    private ledgerService: LedgerService,
  ) {}

  /**
   * Obtém ou cria uma carteira para uma moeda específica
   * 
   * @param userId - ID do usuário
   * @param currency - Código da moeda (BTC, ETH, etc.)
   * @returns Carteira do usuário
   */
  async getOrCreateWallet(userId: string, currency: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: {
        userId_currency: {
          userId,
          currency: currency.toUpperCase(),
        },
      },
    });

    // Se a carteira não existe, cria uma nova com saldo zero
    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          currency: currency.toUpperCase(),
          balance: 0,
        },
      });

      this.logger.log(`Nova carteira criada: ${currency} para usuário ${userId}`);
    }

    return wallet;
  }

  /**
   * Consulta o saldo de todas as carteiras do usuário
   * 
   * @param userId - ID do usuário autenticado
   * @returns Lista de carteiras com saldos
   */
  async getBalance(userId: string) {
    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
      select: {
        currency: true,
        balance: true,
        updatedAt: true,
      },
      orderBy: { currency: 'asc' },
    });

    // Filtra carteiras com saldo zero (opcional)
    const walletsWithBalance = wallets.filter(
      (w) => new Decimal(w.balance.toString()).greaterThan(0),
    );

    return {
      wallets: walletsWithBalance.length > 0 ? walletsWithBalance : wallets,
      total: wallets.length,
    };
  }

  /**
   * Realiza um saque da carteira
   * 
   * Validações:
   * - Usuário tem carteira da moeda
   * - Saldo é suficiente
   * 
   * @param userId - ID do usuário
   * @param withdrawDto - Dados do saque
   * @returns Resultado da operação
   */
  async withdraw(userId: string, withdrawDto: WithdrawDto) {
    const { currency, amount, address } = withdrawDto;

    // Busca a carteira do usuário
    const wallet = await this.getOrCreateWallet(userId, currency);

    const currentBalance = new Decimal(wallet.balance.toString());
    const withdrawAmount = new Decimal(amount.toString());

    // Valida se o saldo é suficiente
    if (currentBalance.lessThan(withdrawAmount)) {
      throw new BadRequestException(
        `Saldo insuficiente. Saldo atual: ${currentBalance.toString()} ${currency}`,
      );
    }

    // Calcula o novo saldo
    const newBalance = currentBalance.minus(withdrawAmount);

    // Atualiza o saldo da carteira em uma transação do banco
    const [updatedWallet] = await this.prisma.$transaction([
      // Atualiza o saldo
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
      // Registra no ledger
      this.prisma.ledgerEntry.create({
        data: {
          userId,
          transactionType: TransactionType.WITHDRAWAL,
          currency,
          amount: withdrawAmount.negated(), // Negativo para representar saída
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          metadata: {
            address,
            timestamp: new Date().toISOString(),
          },
        },
      }),
    ]);

    this.logger.log(
      `Saque realizado: ${withdrawAmount.toString()} ${currency} - Usuário: ${userId}`,
    );

    return {
      message: 'Saque realizado com sucesso',
      withdrawal: {
        currency,
        amount: withdrawAmount.toString(),
        address,
        previousBalance: currentBalance.toString(),
        newBalance: newBalance.toString(),
      },
    };
  }

  /**
   * Adiciona saldo à carteira (usado internamente)
   * 
   * @param userId - ID do usuário
   * @param currency - Moeda
   * @param amount - Quantidade a adicionar
   * @param transactionType - Tipo da transação (DEPOSIT, SWAP_IN, etc.)
   * @param metadata - Dados adicionais
   * @returns Carteira atualizada
   */
  async addBalance(
    userId: string,
    currency: string,
    amount: number | Decimal,
    transactionType: TransactionType,
    metadata?: any,
  ) {
    const wallet = await this.getOrCreateWallet(userId, currency);

    const currentBalance = new Decimal(wallet.balance.toString());
    const addAmount = new Decimal(amount.toString());
    const newBalance = currentBalance.plus(addAmount);

    // Atualiza o saldo e registra no ledger em uma transação atômica
    const [updatedWallet] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
      this.prisma.ledgerEntry.create({
        data: {
          userId,
          transactionType,
          currency,
          amount: addAmount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          metadata: metadata || {},
        },
      }),
    ]);

    this.logger.log(
      `Saldo adicionado: ${addAmount.toString()} ${currency} - Usuário: ${userId}`,
    );

    return updatedWallet;
  }

  /**
   * Remove saldo da carteira (usado internamente)
   * Similar ao withdraw mas sem validações de endereço
   * 
   * @param userId - ID do usuário
   * @param currency - Moeda
   * @param amount - Quantidade a remover
   * @param transactionType - Tipo da transação
   * @param metadata - Dados adicionais
   * @returns Carteira atualizada
   */
  async subtractBalance(
    userId: string,
    currency: string,
    amount: number | Decimal,
    transactionType: TransactionType,
    metadata?: any,
  ) {
    const wallet = await this.getOrCreateWallet(userId, currency);

    const currentBalance = new Decimal(wallet.balance.toString());
    const subtractAmount = new Decimal(amount.toString());
    const newBalance = currentBalance.minus(subtractAmount);

    // Valida saldo suficiente
    if (newBalance.lessThan(0)) {
      throw new BadRequestException('Saldo insuficiente');
    }

    // Atualiza em transação atômica
    const [updatedWallet] = await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
      this.prisma.ledgerEntry.create({
        data: {
          userId,
          transactionType,
          currency,
          amount: subtractAmount.negated(), // Negativo
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          metadata: metadata || {},
        },
      }),
    ]);

    this.logger.log(
      `Saldo removido: ${subtractAmount.toString()} ${currency} - Usuário: ${userId}`,
    );

    return updatedWallet;
  }
}
