/**
 * DTO para Depósito via Webhook
 * 
 * Define os dados recebidos quando um depósito é notificado por um webhook externo.
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsEmail, Matches } from 'class-validator';

export class DepositDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email do usuário que receberá o depósito',
  })
  @IsEmail({}, { message: 'Email inválido' })
  userEmail: string;

  @ApiProperty({
    example: 'BTC',
    description: 'Código da criptomoeda depositada',
  })
  @IsString({ message: 'A moeda deve ser uma string' })
  @Matches(/^[A-Z]{2,10}$/, {
    message: 'Código de moeda inválido (use letras maiúsculas)',
  })
  currency: string;

  @ApiProperty({
    example: 1.5,
    description: 'Quantidade depositada',
  })
  @IsNumber({}, { message: 'A quantidade deve ser um número' })
  @Min(0.00000001, { message: 'A quantidade deve ser maior que zero' })
  amount: number;

  @ApiProperty({
    example: 'ext-deposit-123456',
    description: 'ID externo do depósito (para idempotência)',
  })
  @IsString({ message: 'O ID externo deve ser uma string' })
  externalId: string;
}
