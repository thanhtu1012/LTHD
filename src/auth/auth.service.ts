import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../user/users.service';
import { LoginDto } from './login.dto';
import { User } from '../user/users.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user; // Loại bỏ password khỏi kết quả
      return result;
    }
    return null; // Trả về null nếu xác thực thất bại
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { username, password } = loginDto;

    // Gọi validateUser để xác thực
    const user = await this.validateUser(username, password);
    
    // Kiểm tra nếu người dùng không tồn tại hoặc mật khẩu sai
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Nếu người dùng hợp lệ, tạo token JWT
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }


}