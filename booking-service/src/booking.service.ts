import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService implements OnModuleInit {
  private readonly logger = new Logger(BookingService.name);

  // We inject the Kafka Client registered in app.module.ts with the token 'KAFKA_SERVICE'
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  // Lifecycle hook: runs when this module starts up
  async onModuleInit() {
    // Connect to Kafka broker as a Producer
    await this.kafkaClient.connect();
    this.logger.log('Connected to Kafka Broker as Producer');
  }

  /**
   * Creates a booking and emits an asynchronous event to Kafka topic 'booking-created'
   */
  createBooking(dto: CreateBookingDto) {
    const booking = {
      bookingId: 'BK-' + Date.now(),
      userId: dto.userId,
      eventName: dto.eventName,
      ticketCount: dto.ticketCount,
      totalAmount: dto.ticketCount * dto.price,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    this.logger.log(`Emitting "booking-created" event for booking: ${booking.bookingId}`);

    // emit() sends an EVENT (Pub/Sub pattern - fire and forget).
    // The producer does not wait for a response from the consumer.
    // Kafka serialization: send as JSON string or object
    this.kafkaClient.emit('booking-created', JSON.stringify(booking));

    return {
      message: 'Booking request accepted and event published to Kafka!',
      data: booking,
    };
  }
}
