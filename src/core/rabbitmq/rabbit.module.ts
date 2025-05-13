// payment.module.ts
import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RabbitService } from './rabbit.service';

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'PAYMENT_FAILURE_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            'amqps://tosgbpok:FGXPbWmCuBAraXdqBiGYU6DgmnxCzOIE@jaragua.lmq.cloudamqp.com/tosgbpok',
          ],
          queue: 'payment_failures_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [RabbitService],
  exports: [RabbitService],
})
export class RabbitModule {}
