import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLog } from './notification.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NotificationLog)
    private readonly notificationRepository: Repository<NotificationLog>,
  ) {}

  /**
   * Simulates sending an email/SMS confirmation and records the log in PostgreSQL.
   */
  async sendBookingConfirmation(bookingData: any) {
    const booking =
      typeof bookingData === 'string' ? JSON.parse(bookingData) : bookingData;

    const emailBody = `Dear ${booking.userId}, your booking for "${booking.eventName}" (${booking.ticketCount} tickets, Total: $${booking.totalAmount}) is confirmed! Transaction ID: ${booking.transactionId}`;

    this.logger.log('====================================================');
    this.logger.log('📩 [NOTIFICATION SERVICE] NEW EVENT RECEIVED VIA KAFKA');
    this.logger.log(`Booking ID:   ${booking.bookingId}`);
    this.logger.log(`User ID:      ${booking.userId}`);
    this.logger.log(`Event:        ${booking.eventName}`);
    this.logger.log(`Tickets:      ${booking.ticketCount}`);
    this.logger.log(`Total Amount: $${booking.totalAmount}`);
    this.logger.log(`Transaction:  ${booking.transactionId}`);
    this.logger.log('🚀 ACTION: Sending confirmation email...');

    // Persist notification log to PostgreSQL
    const notification = this.notificationRepository.create({
      bookingId: booking.bookingId,
      userId: booking.userId,
      eventName: booking.eventName,
      channel: 'EMAIL',
      status: 'SENT',
      messageContent: emailBody,
    });

    const savedLog = await this.notificationRepository.save(notification);
    this.logger.log(`[Database] Notification logged to PostgreSQL with ID: ${savedLog.id}`);
    this.logger.log('====================================================');

    return { success: true, notificationId: savedLog.id };
  }
}
