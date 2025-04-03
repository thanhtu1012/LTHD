import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}