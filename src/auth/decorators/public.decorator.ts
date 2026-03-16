/**
 * Decorator @Public()
 * 
 * Marca uma rota como pública (não requer autenticação).
 * 
 * Uso:
 * @Public()
 * @Get('alguma-rota')
 * minhaRotaPublica() { ... }
 */

import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
