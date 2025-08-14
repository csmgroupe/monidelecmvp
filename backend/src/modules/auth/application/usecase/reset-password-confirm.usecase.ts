import { Injectable } from '@nestjs/common';
import { SupabaseAuthService } from '../../infrastructure/adapter/out/supabase-auth.service';
import { ResetPasswordConfirmDto } from '../dto/reset-password-confirm.dto';

@Injectable()
export class ResetPasswordConfirmUseCase {
  constructor(
    private readonly supabaseAuthService: SupabaseAuthService,
  ) {}

  async execute(resetPasswordConfirmDto: ResetPasswordConfirmDto): Promise<boolean> {
    const { code, newPassword } = resetPasswordConfirmDto;
    
    return this.supabaseAuthService.confirmResetPassword(code, newPassword);
  }
} 