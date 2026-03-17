/**
 * Controller de Autenticação
 * 
 * Endpoints disponíveis:
 * - POST /auth/register - Registrar novo usuário
 * - POST /auth/login - Fazer login
 * - POST /auth/refresh - Renovar access token
 */

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './decorators/public.decorator';

@ApiTags('auth') // Agrupa os endpoints no Swagger
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint de Registro
   * Cria uma nova conta de usuário
   */
  @Public() // Rota pública (não requer autenticação)
  @Post('register')
  @ApiOperation({ summary: 'Registrar novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Endpoint de Login
   * Autentica o usuário e retorna tokens JWT
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK) // Login retorna 200 ao invés de 201
  @ApiOperation({ summary: 'Fazer login' })
  @ApiResponse({
    status: 200,
    description: 'Login bem-sucedido. Retorna access token e refresh token',
  })
  @ApiResponse({ status: 401, description: 'Email ou senha inválidos' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Endpoint de Refresh Token
   * Renova o access token expirado usando o refresh token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar access token' })
  @ApiResponse({
    status: 200,
    description: 'Token renovado com sucesso. Retorna novo access token e refresh token',
  })
  @ApiResponse({ status: 401, description: 'Refresh token inválido ou expirado' })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }
}
