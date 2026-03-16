/**
 * Serviço de Ledger (Livro-Razão)
 * 
 * Responsável por registrar TODAS as movimentações financeiras.
 * Garante auditoria completa de todas as transações.
 * 
 * Tipos de transação:
 * - DEPOSIT: Depósito recebido
 * - WITHDRAWAL: Saque realizado
 * - SWAP_IN: Entrada de cripto em swap
 * - SWAP_OUT: Saída de cripto em swap
 * - FEE: Taxa cobrada em operações
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  SWAP_IN = 'SWAP_IN',
  SWAP_OUT = 'SWAP_OUT',
  FEE = 'FEE',
}

interface CreateLedgerEntryParams {
  userId: string;
  transactionType: TransactionType;
  currency: string;
  amount: Decimal | number;
  balanceBefore: Decimal | number;
  balanceAfter: Decimal | number;
  metadata?: any; // Dados adicionais (JSON)
}

@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Cria uma nova entrada no ledger
   * Registra uma movimentação financeira para auditoria
   * 
   * @param params - Dados da transação
   * @returns Entrada criada no ledger
   */
  async createEntry(params: CreateLedgerEntryParams) {
    const { userId, transactionType, currency, amount, balanceBefore, balanceAfter, metadata } =
      params;

    const entry = await this.prisma.ledgerEntry.create({
      data: {
        userId,
        transactionType,
        currency,
        amount: new Decimal(amount.toString()),
        balanceBefore: new Decimal(balanceBefore.toString()),
        balanceAfter: new Decimal(balanceAfter.toString()),
        metadata: metadata || {},
      },
    });

    this.logger.log(
      `Entrada no ledger criada: ${transactionType} - ${amount} ${currency} - Usuário: ${userId}`,
    );

    return entry;
  }

  /**
   * Busca o histórico de transações de um usuário
   * 
   * @param userId - ID do usuário
   * @param options - Opções de filtro (moeda, tipo, paginação)
   * @returns Lista de entradas do ledger
   */
  async getUserHistory(
    userId: string,
    options: {
      currency?: string;
      transactionType?: TransactionType;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    const { currency, transactionType, limit = 50, offset = 0 } = options;

    const where: any = { userId };

    if (currency) {
      where.currency = currency;
    }

    if (transactionType) {
      where.transactionType = transactionType;
    }

    const entries = await this.prisma.ledgerEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' }, // Mais recentes primeiro
      take: limit,
      skip: offset,
    });

    const total = await this.prisma.ledgerEntry.count({ where });

    return {
      entries,
      total,
      limit,
      offset,
    };
  }

  /**
   * Busca todas as entradas de uma transação específica
   * Útil para rastrear operações complexas como swap (que geram múltiplas entradas)
   * 
   * @param metadata - Dados para filtrar (ex: { swapId: '123' })
   * @returns Entradas relacionadas
   */
  async getEntriesByMetadata(metadata: any) {
    // Nota: Prisma não suporta queries complexas em campos JSON nativamente
    // Em produção, considere adicionar um campo transactionId separado
    return this.prisma.ledgerEntry.findMany({
      where: {
        metadata: {
          equals: metadata,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
