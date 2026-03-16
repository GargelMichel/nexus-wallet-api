/**
 * DTO para Login
 * 
 * Define os dados necessários para autenticar um usuário.
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'joao@example.com',
    description: 'Email cadastrado',
  })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({
    example: 'Senha@123',
    description: 'Senha do usuário',
  })
  @IsString({ message: 'A senha deve ser uma string' })
  password: string;
}
