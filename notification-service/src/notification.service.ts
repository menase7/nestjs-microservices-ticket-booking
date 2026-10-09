import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  /**
   * Simulates sending an email/SMS confirmation to the user
   */
  sendBookingConfirmation(bookingData: any) {
    // In case the message was serialized as a string
    const booking =
      typeof bookingData === 'string' ? JSON.parse(bookingData) : bookingData;

    this.logger.log('====================================================');
    this.logger.log('📩 [NOTIFICATION SERVICE] NEW EVENT RECEIVED VIA KAFKA');
    this.logger.log(`Booking ID:   ${booking.bookingId}`);
    this.logger.log(`User ID:      ${booking.userId}`);
    this.logger.log(`Event:        ${booking.eventName}`);
    this.logger.log(`Tickets:      ${booking.ticketCount}`);
    this.logger.log(`Total Amount: $${booking.totalAmount}`);
    this.logger.log(`Status:       ${booking.status}`);
    this.logger.log(`Created At:   ${booking.createdAt}`);
    this.logger.log('🚀 ACTION: Confirmation email sent to user ' + booking.userId);
    this.logger.log('====================================================');

    return { success: true, bookingId: booking.bookingId };
  }
}
