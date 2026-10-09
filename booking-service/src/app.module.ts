import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  imports: [
    // Register the Kafka client microservice provider
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE', // Injection token used in BookingService: @Inject('KAFKA_SERVICE')
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'booking-service', // Identifier for this producer client in Kafka
            brokers: ['localhost:9092'], // Address of our running Kafka broker container
          },
          consumer: {
            groupId: 'booking-producer-client-group', // Consumer group ID used for internal replies
          },
        },
      },
    ]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class AppModule {}
