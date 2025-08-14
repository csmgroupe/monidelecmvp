import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthExceptionFilter } from './common/filters/auth-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global API prefix
  app.setGlobalPrefix('api/v1');
  
  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });
  
  // Use cookie parser middleware
  app.use(cookieParser());
  
  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe());
  
  // Add global auth exception filter
  app.useGlobalFilters(new AuthExceptionFilter());
  
  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description for your NestJS application')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('projects', 'Project management endpoints')
    .addTag('subscriptions', 'Subscription management endpoints')
    .addTag('storage', 'File storage endpoints')
    .addCookieAuth('access_token', {
      type: 'http',
      in: 'cookie',
      scheme: 'bearer',
    })
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
