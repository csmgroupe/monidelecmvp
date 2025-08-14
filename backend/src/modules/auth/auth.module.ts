import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from '../user/user.module';
import { Auth } from './domain/entity/auth.entity';
import { AuthService } from './application/usecase/auth.service';
import { LoginUseCase } from './application/usecase/login.usecase';
import { RegisterUseCase } from './application/usecase/register.usecase';
import { ResetPasswordConfirmUseCase } from './application/usecase/reset-password-confirm.usecase';
import { AuthController } from './infrastructure/adapter/in/auth.controller';
import { SupabaseAuthService } from './infrastructure/adapter/out/supabase-auth.service';
import { AuthRepository } from './infrastructure/persistence/auth.repository';
import { PasswordService } from './domain/service/password.service';
import { JwtService } from './domain/service/jwt.service';
import { AuthGuard } from './infrastructure/guard/auth.guard';
import { AUTH_REPOSITORY_TOKEN } from './domain/repository/auth-repository.interface';

@Module({
  imports: [
    ConfigModule,
    UserModule,
    MikroOrmModule.forFeature([Auth]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LoginUseCase,
    RegisterUseCase,
    ResetPasswordConfirmUseCase,
    SupabaseAuthService,
    PasswordService,
    JwtService,
    {
      provide: AUTH_REPOSITORY_TOKEN,
      useClass: AuthRepository,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService, SupabaseAuthService],
})
export class AuthModule {}
