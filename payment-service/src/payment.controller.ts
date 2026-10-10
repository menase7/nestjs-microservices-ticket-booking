import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Request-Reply pattern:
   * Saves transaction in PostgreSQL and returns receipt to Booking Service
   */
  @MessagePattern('process-payment')
  async handleProcessPayment(@Payload() paymentData: any) {
    return await this.paymentService.processPayment(paymentData);
  }
}
