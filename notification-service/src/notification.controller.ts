import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Listens to the Kafka topic 'booking-created'
   * @EventPattern is used because the producer called client.emit('booking-created', ...)
   */
  @EventPattern('booking-created')
  handleBookingCreated(
    @Payload() message: any,
    @Ctx() context: KafkaContext,
  ) {
    // Extract metadata from the Kafka message context
    const topic = context.getTopic();
    const partition = context.getPartition();
    const { offset } = context.getMessage();

    this.logger.log(
      `Received Kafka message from Topic: [${topic}], Partition: [${partition}], Offset: [${offset}]`,
    );

    // Delegate the actual notification work to the service
    this.notificationService.sendBookingConfirmation(message);
  }
}
