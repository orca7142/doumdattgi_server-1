import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { DynamicAuthGuard } from './guards/dynamic-auth.guard';
import { IOAuthUser } from './interfaces/auth-service.interface';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/login/:social')
  @UseGuards(DynamicAuthGuard)
  loginOAuth(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
  ) {
    this.authService.verifyLogin({ req, res });
  }
}
