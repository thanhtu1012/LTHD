import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as qs from 'qs';
import * as moment from 'moment-timezone';

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
  private readonly tmnCode = '9WVOR8MX'; 
  private readonly secretKey = 'JNPBK6GS6U6TJV9UU7O2UW3PTW5ALFS4'; 
  private readonly vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  private readonly returnUrl = 'http://localhost:3000/payment/return';

  createPaymentUrl(orderId: string, amount: number, ipAddr: string, bankCode?: string, locale: string = 'vn'): string {
    const date = moment().tz('Asia/Ho_Chi_Minh').toDate();    
    console.log('Server time:', date.toISOString());
    const createDate = this.formatDate(date);
    const expireDate = this.formatDate(moment(date).add(5, 'minutes').toDate()); // 5 phút

    const params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan cho ma GD:${orderId}`,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100, // Nhân 100 theo chuẩn VNPAY
      vnp_ReturnUrl: this.returnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    
    const sortedParams = this.sortObject(params);
    const signData = Object.keys(sortedParams)
      .map((key) => `${key}=${encodeURIComponent(sortedParams[key]).replace(/%20/g, '+')}`)
      .join('&');
    const secureHash = crypto
      .createHmac('sha512', this.secretKey)
      .update(signData)
      .digest('hex');

    console.log('Sign data:', signData);
    console.log('Generated vnp_SecureHash:', secureHash);

    sortedParams.vnp_SecureHash = secureHash;
    const queryString = Object.keys(sortedParams)
      .map((key) => `${key}=${encodeURIComponent(sortedParams[key]).replace(/%20/g, '+')}`)
      .join('&');

    return `${this.vnpUrl}?${queryString}`;
  }

  verifyReturn(query: any): { isValid: boolean; responseCode: string } {
    const secretKey = this.secretKey;
    const vnp_SecureHash = query.vnp_SecureHash;
    delete query.vnp_SecureHash;

    const sortedParams = this.sortObject(query);
    const signData = Object.keys(sortedParams)
      .map((key) => `${key}=${encodeURIComponent(sortedParams[key]).replace(/%20/g, '+')}`)
      .join('&');
    const computedHash = crypto.createHmac('sha512', secretKey).update(signData).digest('hex');

    console.log('Verify sign data:', signData);
    console.log('Computed hash:', computedHash);
    console.log('Received vnp_SecureHash:', vnp_SecureHash);

    const isValid = computedHash === vnp_SecureHash;
    const responseCode = query.vnp_ResponseCode || '97'; // 97 nếu checksum sai

    return { isValid, responseCode };
  }


  private sortObject(obj: any): any {
    const sorted: any = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      sorted[key] = obj[key];
    }
    return sorted;
  }

  private formatDate(date: Date): string {
    return moment(date).tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmss');
  }
}