/**
 * Módulo de Autenticação
 * 
 * Configura:
 * - JWT (access token e refresh token)
 * - Passport para autenticação
 * - Estratégias e Guards
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule, // Para acessar variáveis de ambiente
    PassportModule, // Para autenticação
    JwtModule.register({}), // Configuração vazia - usamos secrets dinâmicos no service
    PrismaModule, // Para acessar o banco de dados
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService], // Exporta para outros módulos usarem
})
export class AuthModule {}
