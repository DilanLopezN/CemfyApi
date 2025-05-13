import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { UsersService } from 'src/domain/admin/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(data: { email: string; password: string }) {
    const user = await this.userService.findByEmail(data.email);

    if (!bcrypt.compareSync(data.password, user.password)) {
      throw new Error('Credenciais Invalidas!');
    }

    const { password, ...userData } = user;

    let userAssign;

    if (userData.role === 'PARTNER') {
      userAssign = await this.userService.findPartnerByUserId(user.id);
    }

    const result = {
      tenantId: userAssign?.partnerId,
      email: userData.email,
      role: userData.role,
      id: userData.id,
    };

    return {
      access_token: this.jwtService.sign(result),
    };
  }
}
