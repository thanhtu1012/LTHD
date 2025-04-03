import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; 
import { RoleGuard } from '../auth/role.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RoleGuard)
export class AdminController {
  @Get()
  getAdminPage() {
    return { message: 'Welcome to Admin Page' };
  }
}