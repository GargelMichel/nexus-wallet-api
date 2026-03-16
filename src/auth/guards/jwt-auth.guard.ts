/**
 * Guard JWT para Rotas Protegidas
 * 
 * Use este guard (@UseGuards(JwtAuthGuard)) em rotas que requerem autenticação.
 * Automaticamente valida o token JWT e anexa o usuário ao request.
 */

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * Permite pular a autenticação em rotas marcadas com @Public()
   */
  canActivate(context: ExecutionContext) {
    // Verifica se a rota tem o decorator @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Permite acesso sem autenticação
    }

    // Aplica a validação JWT padrão
    return super.canActivate(context);
  }
}
