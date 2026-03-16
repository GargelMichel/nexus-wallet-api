/**
 * Serviço de Autenticação
 * 
 * Responsável por:
 * - Registrar novos usuários
 * - Validar credenciais no login
 * - Gerar tokens JWT (access e refresh)
 * - Renovar tokens expirados
 */

import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Registra um novo usuário no sistema
   * 
   * @param registerDto - Dados do usuário (nome, email, senha)
   * @returns Usuário criado (sem a senha)
   */
  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;

    // Verifica se o email já está cadastrado
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      this.logger.warn(`Tentativa de registro com email já existente: ${email}`);
      throw new ConflictException('Email já cadastrado');
    }

    // Criptografa a senha com bcrypt (10 rounds de hashing)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o usuário no banco de dados
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }, // Não retorna a senha
    });

    this.logger.log(`Novo usuário registrado: ${email}`);

    return {
      message: 'Usuário registrado com sucesso',
      user,
    };
  }

  /**
   * Realiza o login do usuário
   * 
   * @param loginDto - Email e senha
   * @returns Access token e refresh token
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Busca o usuário pelo email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      this.logger.warn(`Tentativa de login com email inexistente: ${email}`);
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // Verifica se a senha está correta
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Tentativa de login com senha incorreta: ${email}`);
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // Gera os tokens JWT
    const tokens = await this.generateTokens(user.id, user.email);

    this.logger.log(`Login bem-sucedido: ${email}`);

    return {
      message: 'Login realizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      ...tokens,
    };
  }

  /**
   * Renova o access token usando o refresh token
   * 
   * @param refreshToken - Refresh token válido
   * @returns Novo access token e refresh token
   */
  async refreshToken(refreshToken: string) {
    try {
      // Verifica e decodifica o refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Gera novos tokens
      const tokens = await this.generateTokens(payload.sub, payload.email);

      this.logger.log(`Token renovado para usuário: ${payload.email}`);

      return tokens;
    } catch (error) {
      this.logger.warn('Tentativa de renovação com refresh token inválido');
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }
  }

  /**
   * Gera access token e refresh token JWT
   * 
   * @param userId - ID do usuário
   * @param email - Email do usuário
   * @returns Objeto com accessToken e refreshToken
   */
  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    // Access Token (curta duração - 15 minutos)
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
    });

    // Refresh Token (longa duração - 7 dias)
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
