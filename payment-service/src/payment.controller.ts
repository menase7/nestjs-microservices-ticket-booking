import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Request-Reply pattern:
   * Notice @MessagePattern (NOT @EventPattern).
   * Whatever this function returns is automatically sent back to the
   * producer (Booking Service) via Kafka's reply topic!
   */
  @MessagePattern('process-payment')
  handleProcessPayment(@Payload() paymentData: any) {
    return this.paymentService.processPayment(paymentData);
  }
}
