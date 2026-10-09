import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('NotificationMicroserviceBootstrap');

  // Instead of NestFactory.create (which creates an HTTP server),
  // NestFactory.createMicroservice creates a dedicated messaging worker.
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: 'notification-service', // Identifier for this client
          brokers: ['localhost:9092'],       // Kafka Broker host:port
        },
        consumer: {
          // Kafka Consumer Group ID:
          // All instances with this groupId share partitions to divide workload.
          groupId: 'notification-consumer-group',
        },
      },
    },
  );

  // Starts the microservice and joins the Kafka consumer group
  await app.listen();
  logger.log('🚀 Notification Microservice is running and listening to Kafka events...');
}

bootstrap();
