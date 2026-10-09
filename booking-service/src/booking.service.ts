import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService implements OnModuleInit {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // Crucial for Request-Response (send):
    // Instructs Kafka Client to listen to the reply topic: "process-payment.reply"
    this.kafkaClient.subscribeToResponseOf('process-payment');
    await this.kafkaClient.connect();
    this.logger.log('Connected to Kafka Broker as Producer & Reply Consumer');
  }

  /**
   * Complete Microservices Orchestration:
   * 1. RPC Call (send) -> Payment Service (Waits for receipt)
   * 2. Event Stream (emit) -> Notification Service (Fire and forget)
   */
  async createBooking(dto: CreateBookingDto) {
    const bookingId = 'BK-' + Date.now();
    const totalAmount = dto.ticketCount * dto.price;

    this.logger.log(`[Step 1] Requesting payment of $${totalAmount} for ${bookingId} via Kafka RPC...`);

    // ==============================================================
    // PATTERN 1: REQUEST-REPLY (send)
    // We send a command and WAIT for the Payment Service to reply
    // ==============================================================
    const paymentResult: any = await firstValueFrom(
      this.kafkaClient.send(
        'process-payment',
        JSON.stringify({
          bookingId,
          userId: dto.userId,
          totalAmount,
        }),
      ),
    );

    this.logger.log(`[Step 2] Payment receipt received from Payment Service: TXN=${paymentResult.transactionId}`);

    const booking = {
      bookingId,
      userId: dto.userId,
      eventName: dto.eventName,
      ticketCount: dto.ticketCount,
      totalAmount,
      status: paymentResult.success ? 'CONFIRMED' : 'PAYMENT_FAILED',
      transactionId: paymentResult.transactionId,
      createdAt: new Date().toISOString(),
    };

    // ==============================================================
    // PATTERN 2: EVENT STREAMING (emit)
    // Fire-and-forget: broadcast to Notification Service (doesn't wait)
    // ==============================================================
    this.logger.log(`[Step 3] Emitting "booking-created" event to Notification Service...`);
    this.kafkaClient.emit('booking-created', JSON.stringify(booking));

    return {
      message: 'Booking successfully paid and processed across microservices!',
      payment: paymentResult,
      booking,
    };
  }
}
