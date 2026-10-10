import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  /**
   * Processes a payment, saves the transaction to PostgreSQL,
   * and returns the receipt via Kafka reply topic.
   */
  async processPayment(paymentData: any) {
    const data =
      typeof paymentData === 'string' ? JSON.parse(paymentData) : paymentData;

    this.logger.log('====================================================');
    this.logger.log('💳 [PAYMENT SERVICE] PROCESSING PAYMENT REQUEST');
    this.logger.log(`Booking ID:   ${data.bookingId}`);
    this.logger.log(`User ID:      ${data.userId}`);
    this.logger.log(`Amount:       $${data.totalAmount}`);

    const isSuccessful = true;
    const transactionId =
      'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    // Persist payment record to PostgreSQL
    const paymentEntity = this.paymentRepository.create({
      transactionId,
      bookingId: data.bookingId,
      userId: data.userId,
      amount: data.totalAmount,
      status: isSuccessful ? 'SUCCESS' : 'DECLINED',
    });

    const savedPayment = await this.paymentRepository.save(paymentEntity);
    this.logger.log(`[Database] Payment transaction saved with ID: ${savedPayment.id}`);
    this.logger.log(`Transaction Result: ${savedPayment.status}`);
    this.logger.log(`Transaction ID:     ${savedPayment.transactionId}`);
    this.logger.log('====================================================');

    return {
      success: isSuccessful,
      transactionId: savedPayment.transactionId,
      bookingId: savedPayment.bookingId,
      amount: savedPayment.amount,
      timestamp: savedPayment.createdAt.toISOString(),
    };
  }
}
