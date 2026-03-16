/**
 * Decorator @CurrentUser()
 * 
 * Extrai o usuário autenticado do request.
 * 
 * Uso:
 * @Get('perfil')
 * @UseGuards(JwtAuthGuard)
 * meuPerfil(@CurrentUser() user: User) {
 *   return user; // Retorna os dados do usuário autenticado
 * }
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Anexado pelo JwtStrategy
  },
);
