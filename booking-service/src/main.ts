import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('BookingServiceBootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable request payload validation via DTO decorators (@IsString, @Min, etc.)
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const PORT = 3000;
  await app.listen(PORT);
  logger.log(`Booking Service HTTP API is running on: http://localhost:${PORT}`);
}

bootstrap();
