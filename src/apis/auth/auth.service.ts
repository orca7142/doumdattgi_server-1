import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Cache } from 'cache-manager';
import {
  IAuthServiceGetAccessToken,
  IAuthServiceLogin,
  IAuthServiceRestoreAccessToken,
} from './interfaces/auth-service.interface';
import * as jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService, //

    private readonly jwtService: JwtService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  // 로그인하기
  async login({
    email,
    password,
    context,
  }: IAuthServiceLogin): Promise<string> {
    const user = await this.usersService.findOneByEmail({ email });

    if (!user)
      throw new UnprocessableEntityException('일치하는 이메일이 없습니다!!');

    const isAuth = await bcrypt.compare(password, user.password);
    if (!isAuth)
      throw new UnprocessableEntityException('비밀번호가 틀렸습니다');

    const req = context.req;
    const res = context.res;

    this.setRefreshToken({ user, req, res });

    return this.getAccessToken({ user });
  }

  // accessToken 발급하기
  getAccessToken({ user }) {
    return this.jwtService.sign(
      { email: user.email, sub: user.id },
      { secret: process.env.JWT_ACCESS_KEY, expiresIn: '1h' },
    );
  }

  // accessToken 복구하기
  restoreAccessToken({ user }: IAuthServiceRestoreAccessToken): string {
    return this.getAccessToken({ user });
  }

  // refreshToken 발급하기
  setRefreshToken({ user, res, req }) {
    const refreshToken = this.jwtService.sign(
      { email: user.email, sub: user.id },
      { secret: process.env.JWT_REFRESH_KEY, expiresIn: '2w' },
    );
    // 개발환경
    res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; path=/`);

    // 배포환경
    // res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; path=/; domain=.mybacksite.com; SameSite=None; Secure; httpOnly;`)
    // res.setHeader('Access-Control-Allow-Origin', 'https://myfrontsite.com')
  }

  // 소셜로그인시 회원가입 유무에 따라 로그인 또는 회원가입 후 로그인
  async verifyLogin({ req, res }) {
    let user = await this.usersService.findOne({ email: req.user.email });

    if (!user)
      user = await this.usersService.create({
        createUserInput: {
          ...req.user,
        },
      });
    this.setRefreshToken({ user, res, req });
    res.redirect('http://localhost:5501/frontend/login/index.html');
  }

  // 로그아웃 서비스
  async logout(headers) {
    const refreshToken = headers.headers.cookie.replace('refreshToken=', '');
    const accessToken = headers.headers.authorization.replace('Bearer ', '');

    try {
      const accessTokenVerify = jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_KEY,
      ) as JwtPayload;
      const refreshTokenVerify = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_KEY,
      ) as JwtPayload;

      const accessTTL = accessTokenVerify.exp - accessTokenVerify.iat;
      const refreshTTL = refreshTokenVerify.exp - refreshTokenVerify.iat;

      this.saveRedis({ accessToken, refreshToken, accessTTL, refreshTTL });
    } catch (error) {
      throw new UnauthorizedException();
    }
  }

  // 레디스 저장 서비스
  async saveRedis({ accessToken, refreshToken, accessTTL, refreshTTL }) {
    await this.cacheManager.set(`accessToken: ${accessToken}`, accessToken, {
      ttl: accessTTL,
    });
    await this.cacheManager.set(`refreshToken: ${refreshToken}`, refreshToken, {
      ttl: refreshTTL,
    });
  }
}
