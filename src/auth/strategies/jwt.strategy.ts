/**
 * Estratégia JWT para Passport
 * 
 * Valida o access token JWT e extrai os dados do usuário.
 * Usado automaticamente pelo JwtAuthGuard.
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      // Extrai o token do header Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Rejeita tokens expirados
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  /**
   * Valida o payload do JWT e retorna os dados do usuário
   * Este método é chamado automaticamente após validar o token
   * 
   * @param payload - Dados decodificados do JWT
   * @returns Dados do usuário autenticado
   */
  async validate(payload: any) {
    // Busca o usuário no banco para garantir que ainda existe
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Este objeto é anexado ao request como request.user
    return user;
  }
}
