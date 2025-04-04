import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../user/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Trích xuất JWT từ header
        ignoreExpiration: false, // Không bỏ qua token hết hạn (tùy chọn)
        secretOrKey: 'secretKey', // Khóa bí mật để giải mã token
    });
  }


  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.username);
    return { id: payload.sub, username: payload.username, role: payload.role };
  }

  
}