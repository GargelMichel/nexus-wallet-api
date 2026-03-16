/**
 * DTO para Renovação de Token
 * 
 * Usado para obter um novo access token usando o refresh token.
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token obtido no login',
  })
  @IsString({ message: 'O refresh token deve ser uma string' })
  refreshToken: string;
}
