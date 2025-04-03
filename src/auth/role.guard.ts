import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRole = this.reflector.get<string>('role', context.getHandler());
    if (!requiredRole) return true; // Không yêu cầu role cụ thể

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Lấy từ JWT

    return user && user.role === requiredRole;
  }
}