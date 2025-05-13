import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() data: { email: string; password: string },
    @Res() response: Response,
  ) {
    const { access_token } = await this.authService.login(data);
    return response.status(HttpStatus.OK).json({
      access_token,
    });
  }
}
