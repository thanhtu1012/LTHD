import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as qs from 'qs';

// @Injectable()
// export class PaymentService {

//     private readonly tmnCode = '53TDZ35W';
//     private readonly secretKey = '5FFVFTWIYHI5BOX5Z1E5CE65EROFDZNZ';
//     private readonly vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
//     private readonly returnUrl = 'http://localhost:3000/payment/return';

//   createPaymentUrl(orderId: string, amount: number, ipAddr: string): string {
//     const date = new Date();
//     const createDate = this.formatDate(date);
//     const expireDate = this.formatDate(new Date(date.getTime() + 15 * 60 * 1000));

//     const params = {
//       vnp_Version: '2.1.0',
//       vnp_Command: 'pay',
//       vnp_TmnCode: this.tmnCode,
//       vnp_Amount: amount * 100,
//       vnp_CurrCode: 'VND',
//       vnp_TxnRef: orderId,
//       vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
//       vnp_OrderType: 'other',
//       vnp_Locale: 'vn',
//       vnp_ReturnUrl: this.returnUrl,
//       vnp_IpAddr: ipAddr,
//       vnp_CreateDate: createDate,
//       vnp_ExpireDate: expireDate,
//     };

//     const sortedParams = this.sortObject(params);
//     const signData = Object.keys(sortedParams)
//       .map((key) => `${key}=${encodeURIComponent(sortedParams[key])}`)
//       .join('&');
//     const secureHash = crypto
//       .createHmac('sha512', this.secretKey) // secretKey là string
//       .update(signData)
//       .digest('hex');

//     sortedParams.vnp_SecureHash = secureHash;
//     const queryString = Object.keys(sortedParams)
//       .map((key) => `${key}=${encodeURIComponent(sortedParams[key])}`)
//       .join('&');

//     return `${this.vnpUrl}?${queryString}`;
//   }

//   private sortObject(obj: any): any {
//     return Object.keys(obj)
//       .sort()
//       .reduce((result, key) => {
//         result[key] = obj[key];
//         return result;
//       }, {});
//   }

//   private formatDate(date: Date): string {
//     return date
//       .toISOString()
//       .replace(/[^0-9]/g, '')
//       .slice(0, 14);
//   }

//   verifyReturn(query: any, vnp_SecureHash: string): boolean {

//     const secretKey = this.secretKey;

//     delete query.vnp_SecureHash;

//     const sortedParams = this.sortObject(query);
//     const signData = Object.keys(sortedParams)
//       .map((key) => `${key}=${encodeURIComponent(sortedParams[key])}`)
//       .join('&');
//     const computedHash = crypto
//       .createHmac('sha512', secretKey)
//       .update(signData)
//       .digest('hex');

//     return computedHash === vnp_SecureHash;
//   }
// }
@Injectable()
export class PaymentService {
  private readonly tmnCode = '53TDZ35W'; 
  private readonly secretKey = '5FFVFTWIYHI5BOX5Z1E5CE65EROFDZNZ'; 
  private readonly vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  private readonly returnUrl = 'http://localhost:3000/payment/return';

  createPaymentUrl(orderId: string, amount: number, ipAddr: string, bankCode?: string, locale: string = 'vn'): string {
    process.env.TZ = 'Asia/Ho_Chi_Minh'; // Đặt múi giờ
    
    const date = new Date();
    const createDate = this.formatDate(date);
    const expireDate = this.formatDate(new Date(date.getTime() + 15 * 60 * 1000)); // 15 phút

    let vnp_Params: any = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: locale || 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan cho ma GD:${orderId}`,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100, // Nhân 100 theo chuẩn VNPAY
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    if (bankCode && bankCode !== '') {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = this.sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', this.secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnp_Params['vnp_SecureHash'] = signed;
    const queryString = qs.stringify(vnp_Params, { encode: false });

    return `${this.vnpUrl}?${queryString}`;
  }

  verifyReturn(query: any): { isValid: boolean; responseCode: string } {
    let vnp_Params = { ...query };
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = this.sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', this.secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return {
      isValid: secureHash === signed,
      responseCode: vnp_Params['vnp_ResponseCode'] || '97', // 97 là mã lỗi checksum thất bại
    };
  }

  private sortObject(obj: any): any {
    const sorted: any = {};
    const str = Object.keys(obj)
      .filter((key) => obj.hasOwnProperty(key))
      .sort();
    for (const key of str) {
      sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
    }
    return sorted;
  }

  private formatDate(date: Date): string {
    return date
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, 14);
  }
}