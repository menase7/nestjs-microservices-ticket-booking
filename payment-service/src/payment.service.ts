import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  /**
   * Processes a payment and returns the receipt to be sent back via Kafka reply topic
   */
  processPayment(paymentData: any) {
    const data =
      typeof paymentData === 'string' ? JSON.parse(paymentData) : paymentData;

    this.logger.log('====================================================');
    this.logger.log('💳 [PAYMENT SERVICE] PROCESSING PAYMENT REQUEST');
    this.logger.log(`Booking ID:   ${data.bookingId}`);
    this.logger.log(`User ID:      ${data.userId}`);
    this.logger.log(`Amount:       $${data.totalAmount}`);

    // Simulate payment processing
    const isSuccessful = true; // In production, call Stripe / PayPal API
    const transactionId = 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    this.logger.log(`Transaction Result: ${isSuccessful ? 'SUCCESS' : 'DECLINED'}`);
    this.logger.log(`Transaction ID:     ${transactionId}`);
    this.logger.log('====================================================');

    // This object is automatically sent back to Booking Service via the Kafka reply topic!
    return {
      success: isSuccessful,
      transactionId,
      bookingId: data.bookingId,
      amount: data.totalAmount,
      timestamp: new Date().toISOString(),
    };
  }
}
