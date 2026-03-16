/**
 * Filtro Global de Exceções
 * 
 * Intercepta TODOS os erros da aplicação e retorna respostas padronizadas.
 * 
 * Benefícios:
 * - Respostas de erro consistentes em toda a API
 * - Logs detalhados de erros para debug
 * - Não expõe detalhes internos em produção
 * - Facilita tratamento de erros no frontend
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch() // Captura TODAS as exceções (HTTP e não-HTTP)
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determina o status HTTP do erro
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Obtém a mensagem de erro
    let message = 'Erro interno do servidor';
    let errors = null;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      
      // Se a resposta for um objeto, extrair mensagem e erros de validação
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        errors = (exceptionResponse as any).errors || null;
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Monta o objeto de resposta de erro
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: Array.isArray(message) ? message : [message],
      ...(errors && { errors }), // Inclui erros de validação se existirem
    };

    // Loga o erro para debug
    this.logger.error(
      `${request.method} ${request.url} - Status: ${status}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    // Retorna a resposta de erro padronizada
    response.status(status).json(errorResponse);
  }
}
