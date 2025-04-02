import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../user/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({ secret: 'secretKey', signOptions: { expiresIn: '60m' } })],
  providers: [AuthService, JwtStrategy, LocalStrategy, ],
  controllers: [AuthController],
})
export class AuthModule {}