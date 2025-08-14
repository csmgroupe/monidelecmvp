import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { SupabaseAuthService } from '../adapter/out/supabase-auth.service';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly supabaseAuthService: SupabaseAuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    
    // Get token from cookie first, then fallback to Authorization header
    let token = request.cookies?.['access_token'];
    
    if (!token) {
      const authHeader = request.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    // NEW BLOCK: If no access token but a refresh token exists, attempt to refresh the session
    if (!token && request.cookies?.['refresh_token']) {
      const refreshToken = request.cookies['refresh_token'];
      const refreshResult = await this.supabaseAuthService.refreshSession(refreshToken);
      if (refreshResult?.session?.access_token) {
        token = refreshResult.session.access_token;
        // Update cookies with new tokens
        const response = context.switchToHttp().getResponse();
        response.cookie('access_token', refreshResult.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        if (refreshResult.session.refresh_token) {
          response.cookie('refresh_token', refreshResult.session.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });
        }
      }
    }
    
    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      // Verify the token and get user data
      let user = await this.supabaseAuthService.getUserByToken(token);
      
      // If token invalid/expired but refresh token exists, attempt refresh once more
      if (!user && request.cookies?.['refresh_token']) {
        const refreshToken = request.cookies['refresh_token'];
        const refreshResult = await this.supabaseAuthService.refreshSession(refreshToken);
        if (refreshResult?.session?.access_token) {
          token = refreshResult.session.access_token;
          user = refreshResult.user ?? refreshResult.session.user;
          // Update cookies with new tokens
          const response = context.switchToHttp().getResponse();
          response.cookie('access_token', refreshResult.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
          });
          if (refreshResult.session.refresh_token) {
            response.cookie('refresh_token', refreshResult.session.refresh_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
          }
        }
      }
      
      if (!user) {
        throw new UnauthorizedException('Invalid or expired authentication token');
      }

      // Attach user to request object for use in controllers
      request['user'] = user;
      (request as any).user = user;
      
      return true;
    } catch (error) {
      // Clear invalid cookies
      const response = context.switchToHttp().getResponse();
      response.clearCookie('access_token');
      response.clearCookie('refresh_token');
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw new UnauthorizedException('Authentication failed');
    }
  }
} 