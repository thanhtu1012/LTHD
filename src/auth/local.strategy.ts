import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'username' }); // Xác định trường username trong request
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password); // Gọi validateUser
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return user; // Trả về user nếu hợp lệ
  }
}