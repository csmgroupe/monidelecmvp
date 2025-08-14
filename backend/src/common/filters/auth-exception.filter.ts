import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';

@Catch(UnauthorizedException)
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    // Clear auth cookies on 401 errors
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    
    response.status(401).json({
      statusCode: 401,
      message: exception.message || 'Unauthorized',
      error: 'Unauthorized',
      timestamp: new Date().toISOString(),
    });
  }
} 