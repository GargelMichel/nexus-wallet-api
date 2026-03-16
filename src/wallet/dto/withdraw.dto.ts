/**
 * DTO para Saque
 * 
 * Define os dados necessários para realizar um saque.
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, Matches } from 'class-validator';

export class WithdrawDto {
  @ApiProperty({
    example: 'BTC',
    description: 'Código da criptomoeda (BTC, ETH, USDT, etc.)',
  })
  @IsString({ message: 'A moeda deve ser uma string' })
  @Matches(/^[A-Z]{2,10}$/, {
    message: 'Código de moeda inválido (use letras maiúsculas, ex: BTC, ETH)',
  })
  currency: string;

  @ApiProperty({
    example: 0.5,
    description: 'Quantidade a sacar (deve ser maior que zero)',
  })
  @IsNumber({}, { message: 'A quantidade deve ser um número' })
  @Min(0.00000001, { message: 'A quantidade deve ser maior que zero' })
  amount: number;

  @ApiProperty({
    example: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    description: 'Endereço da carteira de destino',
  })
  @IsString({ message: 'O endereço deve ser uma string' })
  address: string;
}
