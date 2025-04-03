import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async create(user: Partial<User>): Promise<User> {

    // Kiểm tra username và password
    if (!user.username) {
        throw new Error('Username is required');
      }
      if (!user.password) {
        throw new Error('Password is required');
      }
      
    // Kiểm tra xem username đã tồn tại chưa
    const existingUser = await this.findOne(user.username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Mã hóa mật khẩu trước khi lưu
    const saltRounds = 10;
    if (!user.password) {
        throw new Error('Password is required');
      }
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);

    // Tạo đối tượng user mới
    const newUser = this.usersRepository.create({
      ...user,
      password: hashedPassword,
      role: user.role || 'user', //Mặc định là user
    });

    // Lưu vào cơ sở dữ liệu
    return this.usersRepository.save(newUser);
  }

}