import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from './booking.entity';

@Module({
  imports: [
    // Connect to PostgreSQL container on port 5434
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5434,
      username: 'postgres',
      password: 'postgrespassword',
      database: 'ticket_booking_db',
      entities: [Booking],
      synchronize: true, // Auto-creates/syncs table schema in development
    }),
    TypeOrmModule.forFeature([Booking]),

    // Register Kafka client provider
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'booking-service',
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'booking-producer-client-group',
          },
        },
      },
    ]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class AppModule {}
