import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('PaymentMicroserviceBootstrap');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'payment-service',
          brokers: ['localhost:9092'],
        },
        consumer: {
          groupId: 'payment-consumer-group',
        },
      },
    },
  );

  await app.listen();
  logger.log('💳 Payment Microservice is running and ready for payment requests...');
}

bootstrap();
