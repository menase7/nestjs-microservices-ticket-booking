import { Inject, Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './booking.entity';

@Injectable()
export class BookingService implements OnModuleInit {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
  ) {}

  async onModuleInit() {
    // Listen to Kafka reply topic for process-payment
    this.kafkaClient.subscribeToResponseOf('process-payment');
    await this.kafkaClient.connect();
    this.logger.log('Connected to Kafka Broker as Producer & Reply Consumer');
  }

  /**
   * Complete Microservices Orchestration with Database Persistence:
   * 1. RPC Call (send) -> Payment Service (Waits for receipt)
   * 2. Save Booking to PostgreSQL Database
   * 3. Event Stream (emit) -> Notification Service (Fire and forget)
   */
  async createBooking(dto: CreateBookingDto) {
    const bookingId = 'BK-' + Date.now();
    const totalAmount = dto.ticketCount * dto.price;

    this.logger.log(`[Step 1] Requesting payment of $${totalAmount} for ${bookingId} via Kafka RPC...`);

    // ==============================================================
    // PATTERN 1: REQUEST-REPLY (send) -> Payment Service
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

    this.logger.log(`[Step 2] Payment receipt received: TXN=${paymentResult.transactionId}`);

    // ==============================================================
    // DATABASE PERSISTENCE: Save booking record to PostgreSQL
    // ==============================================================
    const bookingEntity = this.bookingRepository.create({
      bookingId,
      userId: dto.userId,
      eventName: dto.eventName,
      ticketCount: dto.ticketCount,
      totalAmount,
      status: paymentResult.success ? 'CONFIRMED' : 'PAYMENT_FAILED',
      transactionId: paymentResult.transactionId,
    });

    const savedBooking = await this.bookingRepository.save(bookingEntity);
    this.logger.log(`[Database] Booking saved to PostgreSQL with UUID: ${savedBooking.id}`);

    // ==============================================================
    // PATTERN 2: EVENT STREAMING (emit) -> Notification Service
    // ==============================================================
    this.logger.log(`[Step 3] Emitting "booking-created" event to Notification Service...`);
    this.kafkaClient.emit('booking-created', JSON.stringify(savedBooking));

    return {
      message: 'Booking successfully paid, saved to database, and event published!',
      payment: paymentResult,
      booking: savedBooking,
    };
  }

  /**
   * Fetch all bookings from PostgreSQL
   */
  async getAllBookings(): Promise<Booking[]> {
    return this.bookingRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
