import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/users.entity';
import { AuthController } from './auth/auth.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql', // Kết nối tới MSSQL
      host: 'localhost',
      port: 1433,
      username: 'sa',
      password: 'sa', // Nên thay bằng biến môi trường
      database: 'AuthDB',
      entities: [User], // Danh sách entities
      synchronize: true, // Tự động tạo bảng (chỉ dùng trong dev)
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AuthController], // Khai báo controller chính (nếu cần)
  providers: [AppService, AuthService], // Khai báo service chính (nếu cần)
})
export class AppModule {}
