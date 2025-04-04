import { Controller, Get, Req, Res, Query, UseGuards, SetMetadata } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../auth/role.guard';
import { Request, Response } from 'express';

// @Controller('payment')
// export class PaymentController {
//   constructor(private paymentService: PaymentService) {}

//   @Get()
//   @UseGuards(JwtAuthGuard, RoleGuard)
//   @SetMetadata('role', 'user') // Chỉ cho phép user với role: user
//   createPayment(@Req() req: Request, @Res() res: Response, ) {
//     const orderId = Date.now().toString(); // ID đơn hàng tạm thời
//     const amount = 100000; // Số tiền cố định (100,000 VND)
//     const ipAddr = req.ip || req.connection.remoteAddress || '127.0.0.1'; // Giá trị mặc định nếu undefined

//     const paymentUrl = this.paymentService.createPaymentUrl(orderId, amount, ipAddr);
//     console.log('Redirecting to VNPAY URL:', paymentUrl);
//     return res.redirect(paymentUrl);
//   }

//   @Get('return')
//   handleReturn(@Query() query: any, @Res() res: Response) {
//     const vnp_SecureHash = query.vnp_SecureHash;
//     const isValid = this.paymentService.verifyReturn(query, vnp_SecureHash);

//     console.log('VNPAY Return Query:', query); // Debug kết quả trả về
//     if (isValid && query.vnp_ResponseCode === '00') {
//       return res.redirect('http://127.0.0.1:5500/payment.html?status=success&txn=' + query.vnp_TransactionNo);
//     } else {
//       return res.redirect('http://127.0.0.1:5500/payment.html?status=fail&code=' + query.vnp_ResponseCode);
//     }
//   }
// }

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @SetMetadata('role', 'user')

  
  createPayment(@Req() req: Request, @Res() res: Response) {
    const orderId = Date.now().toString();
    const amount = 100000; 
    const ipAddr = req.ip || req.connection.remoteAddress || '127.0.0.1';
  
    const paymentUrl = this.paymentService.createPaymentUrl(orderId, amount, ipAddr);
    console.log('Generated VNPAY URL:', paymentUrl);
  
    return res.json({ redirectUrl: paymentUrl }); // Trả về JSON thay vì redirect
  }

  @Get('return')
  handleReturn(@Query() query: any, @Res() res: Response) {
    const { isValid, responseCode } = this.paymentService.verifyReturn(query);
    console.log('VNPAY Return Query:', query);

    if (isValid) {
      // Kiểm tra và thông báo kết quả
      if (responseCode === '00') {
        return res.redirect(
          'http://localhost:8080/payment.html?status=success&txn=' + query.vnp_TransactionNo,
        );
      } else {
        return res.redirect(
          'http://localhost:8080/payment.html?status=fail&code=' + responseCode,
        );
      }
    } else {
      return res.redirect('http://localhost:8080/payment.html?status=fail&code=97');
    }
  }
}