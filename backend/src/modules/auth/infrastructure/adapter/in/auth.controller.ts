import { Body, Controller, Post, Get, Query, Headers, Param, Res, Req, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiCookieAuth, ApiQuery } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthResponseDto } from '../../../application/dto/auth-response.dto';
import { LoginDto } from '../../../application/dto/login.dto';
import { RegisterDto } from '../../../application/dto/register.dto';
import { UpdatePasswordDto } from '../../../application/dto/update-password.dto';
import { ResetPasswordConfirmDto } from '../../../application/dto/reset-password-confirm.dto';
import { SSOCallbackDto, SSORequestDto } from '../../../application/dto/sso.dto';
import { AuthService } from '../../../application/usecase/auth.service';
import { SupabaseAuthService } from '../out/supabase-auth.service';
import { Public } from '../../decorator/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly supabaseAuthService: SupabaseAuthService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: RegisterDto })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponseDto> {
    const result = await this.authService.register(registerDto);
    
    // Set HttpOnly cookies with the tokens
    this.setAuthCookies(response, result.accessToken, result.refreshToken);
    
    // Remove tokens from response body for security
    const { accessToken, refreshToken, ...userResponse } = result as any;
    return userResponse as AuthResponseDto;
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(loginDto);
    
    // Set HttpOnly cookies with the tokens
    this.setAuthCookies(response, result.accessToken, result.refreshToken);
    
    // Remove tokens from response body for security
    const { accessToken, refreshToken, ...userResponse } = result as any;
    return userResponse as AuthResponseDto;
  }

  @Post('signout')
  @ApiOperation({ summary: 'Sign out user' })
  @ApiResponse({ status: 200, description: 'User successfully signed out' })
  @ApiCookieAuth('access_token')
  async signOut(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<{ success: boolean }> {
    // Clear the auth cookies
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    
    // Get token from cookie if available
    const token = request.cookies['access_token'];
    if (token) {
      await this.authService.signOut(token);
    }
    
    return { success: true };
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({ status: 400, description: 'Invalid email or redirect URL' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        redirectUrl: { type: 'string', format: 'uri' }
      },
      required: ['email', 'redirectUrl']
    }
  })
  async resetPassword(
    @Body('email') email: string,
    @Body('redirectUrl') redirectUrl: string,
  ): Promise<{ success: boolean }> {
    const success = await this.authService.resetPassword(email, redirectUrl);
    return { success };
  }

  @Public()
  @Post('confirm-reset-password')
  @ApiOperation({ summary: 'Confirm password reset with code' })
  @ApiResponse({ status: 200, description: 'Password successfully reset' })
  @ApiResponse({ status: 400, description: 'Invalid code or password format' })
  @ApiResponse({ status: 401, description: 'Invalid or expired reset code' })
  @ApiBody({ type: ResetPasswordConfirmDto })
  async confirmResetPassword(
    @Body() resetPasswordConfirmDto: ResetPasswordConfirmDto,
  ): Promise<{ success: boolean }> {
    const success = await this.authService.confirmResetPassword(
      resetPasswordConfirmDto.code,
      resetPasswordConfirmDto.newPassword
    );
    return { success };
  }

  @Post('update-password')
  @ApiOperation({ summary: 'Update user password' })
  @ApiResponse({ status: 200, description: 'Password successfully updated' })
  @ApiResponse({ status: 401, description: 'Invalid current password or expired token' })
  @ApiResponse({ status: 400, description: 'Invalid password format' })
  @ApiCookieAuth('access_token')
  @ApiBody({ type: UpdatePasswordDto })
  async updatePassword(
    @Req() request: Request,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<{ success: boolean }> {
    // Get token from cookie instead of Authorization header
    const token = request.cookies['access_token'];
    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }
    
    const success = await this.authService.updatePassword(
      token, 
      updatePasswordDto.currentPassword,
      updatePasswordDto.newPassword
    );
    return { success };
  }

  @Get('user')
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'Current user data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiCookieAuth('access_token')
  async getUser(@Req() request: Request): Promise<any> {
    const token = request.cookies['access_token'];
    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }
    
    const user = await this.authService.getUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
    
    return user;
  }

  @Public()
  @Post('sso')
  @ApiOperation({ summary: 'Initiate SSO authentication' })
  @ApiResponse({ status: 200, description: 'SSO authentication URL generated' })
  @ApiResponse({ status: 400, description: 'Invalid provider or parameters' })
  @ApiBody({ type: SSORequestDto })
  async signInWithSSO(@Body() ssoRequestDto: SSORequestDto) {
    try {
      const { provider, redirectTo } = ssoRequestDto;
      const data = await this.supabaseAuthService.signInWithSSO(provider, redirectTo);
      
      return {
        url: data.url,
        provider: data.provider,
      };
    } catch (error) {
      throw new BadRequestException(`SSO initiation failed: ${error.message}`);
    }
  }

  @Public()
  @Get('sso/callback')
  @ApiOperation({ summary: 'Handle SSO callback with authorization code or redirect for implicit flow' })
  @ApiQuery({ name: 'code', description: 'Authorization code from OAuth provider', required: false })
  @ApiQuery({ name: 'access_token', description: 'Access token from implicit flow', required: false })
  @ApiQuery({ name: 'state', description: 'State parameter', required: false })
  @ApiQuery({ name: 'redirect_to', description: 'Final redirect URL', required: false })
  @ApiResponse({ status: 302, description: 'Redirect to frontend with authentication' })
  async handleSSOCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('code') code?: string,
    @Query('access_token') accessToken?: string,
    @Query('refresh_token') refreshToken?: string,
    @Query('state') state?: string,
    @Query('redirect_to') redirectTo?: string
  ) {
    try {
      if (code) {
        // Authorization code flow
        const data = await this.authService.handleSSOCallback(code);
        
        // Set HttpOnly cookies with the tokens
        if (data.session?.access_token) {
          this.setAuthCookies(res, data.session.access_token, data.session?.refresh_token);
        }
        
        // Determine final redirect URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const finalRedirectUrl = redirectTo || `${frontendUrl}/dashboard`;
        
        return res.redirect(finalRedirectUrl);
      } else if (accessToken) {
        // Implicit flow - handle tokens from query params
        const user = await this.supabaseAuthService.getUserByToken(accessToken);
        
        if (!user) {
          throw new BadRequestException('Invalid access token');
        }

        // Create user in our database if needed
        await this.authService.handleSSOUser(user);

        // Set HttpOnly cookies with the tokens
        this.setAuthCookies(res, accessToken, refreshToken);
        
        // Determine final redirect URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const finalRedirectUrl = redirectTo || `${frontendUrl}/dashboard`;
        
        return res.redirect(finalRedirectUrl);
      } else {
        // No code or access_token in query params - likely implicit flow with tokens in fragment
        // Redirect to a frontend page that can extract tokens from URL fragment and send them back
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
        return res.redirect(`${frontendUrl}/auth/callback${queryString}`);
      }
    } catch (error) {
      console.error('SSO callback error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(error.message)}`);
    }
  }

  @Public()
  @Post('sso/callback')
  @ApiOperation({ summary: 'Handle SSO callback with tokens from frontend (fallback for implicit flow)' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
        redirect_to: { type: 'string' }
      }
    }
  })
  async handleSSOCallbackPost(
    @Body('access_token') accessToken: string,
    @Res({ passthrough: true }) res: Response,
    @Body('refresh_token') refreshToken?: string,
    @Body('redirect_to') redirectTo?: string
  ) {
    try {
      if (!accessToken) {
        throw new BadRequestException('Access token is required');
      }

      // Get user data using the access token
      const user = await this.supabaseAuthService.getUserByToken(accessToken);
      
      if (!user) {
        throw new BadRequestException('Invalid access token');
      }

      // Create user in our database if needed
      await this.authService.handleSSOUser(user);

      // Set HttpOnly cookies with the tokens
      this.setAuthCookies(res, accessToken, refreshToken);
      
      return { success: true };
    } catch (error) {
      console.error('SSO callback error:', error);
      throw new BadRequestException(`SSO callback failed: ${error.message}`);
    }
  }
  
  @Public()
  @Get('error')
  @ApiOperation({ summary: 'Handle authentication errors' })
  @ApiQuery({ name: 'message', description: 'Error message', required: false })
  async handleAuthError(
    @Res() res: Response,
    @Query('message') message?: string
  ) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/auth/error?message=${encodeURIComponent(message || 'Authentication failed')}`);
  }
  
  // Helper method to set auth cookies
  private setAuthCookies(response: Response, accessToken: string, refreshToken?: string) {
    // Set access token cookie
    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });
    
    // Set refresh token cookie if available
    if (refreshToken) {
      response.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });
    }
  }
}
