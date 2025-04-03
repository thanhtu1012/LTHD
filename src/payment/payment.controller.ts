import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';

@Controller('payment')
@UseGuards(JwtAuthGuard, RoleGuard)
export class PaymentController {
  @Get()
  getPaymentPage() {
    return { message: 'Welcome to Payment Page' };
  }
}