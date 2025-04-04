import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:8080', 
    methods: 'GET,POST,OPTIONS', // Thêm OPTIONS
    allowedHeaders: 'Content-Type,Authorization', // Cho phép header Authorization
    credentials: true, // Cho phép gửi token
  }); // Bật CORS
  await app.listen(3000);
}
bootstrap();
