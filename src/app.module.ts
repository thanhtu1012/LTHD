  import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/users.entity';
import { AdminModule } from './admin/admin.module';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }), // Đọc .env toàn cục
    TypeOrmModule.forRoot({
      type: 'mssql', // Kết nối tới MSSQL
      host: 'localhost',
      port: 1433,
      username: 'sa',
      password: 'sa', 
      database: 'AuthDB',
      entities: [User], // Danh sách entities
      synchronize: true, // Tự động tạo bảng 
      options: {
        trustServerCertificate: true, // Bỏ qua lỗi chứng chỉ tự ký
      },
    }),
    AuthModule,
    UsersModule,
    AdminModule,
    PaymentModule,
  ],
})
export class AppModule {}
