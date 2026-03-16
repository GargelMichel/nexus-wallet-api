/**
 * DTO para Swap (Troca de Criptomoedas)
 * 
 * Define os dados necessários para realizar uma troca entre duas criptomoedas.
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min, Matches } from 'class-validator';

export class SwapDto {
  @ApiProperty({
    example: 'BTC',
    description: 'Moeda de origem (que será trocada)',
  })
  @IsString({ message: 'A moeda de origem deve ser uma string' })
  @Matches(/^[A-Z]{2,10}$/, {
    message: 'Código de moeda inválido',
  })
  fromCurrency: string;

  @ApiProperty({
    example: 'ETH',
    description: 'Moeda de destino (que será recebida)',
  })
  @IsString({ message: 'A moeda de destino deve ser uma string' })
  @Matches(/^[A-Z]{2,10}$/, {
    message: 'Código de moeda inválido',
  })
  toCurrency: string;

  @ApiProperty({
    example: 0.1,
    description: 'Quantidade da moeda de origem a ser trocada',
  })
  @IsNumber({}, { message: 'A quantidade deve ser um número' })
  @Min(0.00000001, { message: 'A quantidade deve ser maior que zero' })
  amount: number;
}
