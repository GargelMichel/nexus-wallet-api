/**
 * DTO (Data Transfer Object) para Registro de Usuário
 * 
 * Define a estrutura e validações dos dados necessários para criar uma conta.
 * Usa decorators do class-validator para validação automática.
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do usuário',
  })
  @IsString({ message: 'O nome deve ser uma string' })
  @MinLength(3, { message: 'O nome deve ter pelo menos 3 caracteres' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres' })
  name: string;

  @ApiProperty({
    example: 'joao@example.com',
    description: 'Email para login (deve ser único)',
  })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({
    example: 'Senha@123',
    description: 'Senha forte (mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número)',
  })
  @IsString({ message: 'A senha deve ser uma string' })
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'A senha deve conter pelo menos 1 letra maiúscula, 1 minúscula e 1 número',
  })
  password: string;
}
