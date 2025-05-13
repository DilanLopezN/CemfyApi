// payment.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

interface PaymentFailure {
  data: Record<string, any>;
}

@Injectable()
export class RabbitService {
  constructor(@Inject('PAYMENT_FAILURE_SERVICE') private client: ClientProxy) {}

  async reportPaymentFailure(failureData: PaymentFailure) {
    return this.client.emit('payment.failure', failureData.data);
  }
}
