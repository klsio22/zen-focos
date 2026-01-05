import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Enable CORS with configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000/api/docs',
    'http://localhost:3001/api/docs',
  ];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('ZenFocos API')
    .setDescription('Pomodoro Task Manager API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  logger.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
}
void bootstrap();
