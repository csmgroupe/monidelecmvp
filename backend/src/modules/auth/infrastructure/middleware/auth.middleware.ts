import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SupabaseAuthService } from '../adapter/out/supabase-auth.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly supabaseAuthService: SupabaseAuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Get token from cookie first, then fallback to Authorization header
      let token = req.cookies['access_token'];
      
      if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }
      
      if (!token) {
        throw new UnauthorizedException('No authentication token provided');
      }

      // Verify the token and get user data
      const user = await this.supabaseAuthService.getUserByToken(token);
      
      if (!user) {
        throw new UnauthorizedException('Invalid or expired authentication token');
      }

      // Attach user to request object for use in controllers
      req['user'] = user;
      (req as any).user = user;
      
      next();
    } catch (error) {
      // Clear invalid cookies
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      
      // If it's already an UnauthorizedException, re-throw it
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      // For any other error during authentication, throw 401
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
