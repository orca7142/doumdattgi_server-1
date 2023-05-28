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
  IAuthServiceLogOut,
  IAuthServiceLogin,
  IAuthServiceRestoreAccessToken,
  IAuthServiceSetRefreshToken,
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

  async login({
    user_email,
    user_password,
    context,
  }: IAuthServiceLogin): Promise<string> {
    const user = await this.usersService.findOneByEmail({ user_email });

    if (!user)
      throw new UnprocessableEntityException('일치하는 이메일이 없습니다!!');

    const isAuth = await bcrypt.compare(user_password, user.user_password);
    if (!isAuth)
      throw new UnprocessableEntityException('비밀번호가 틀렸습니다');

    const req = context.req;
    const res = context.res;

    this.setRefreshToken({ user, req, res });

    return this.getAccessToken({ user });
  }

  getAccessToken({ user }: IAuthServiceGetAccessToken) {
    return this.jwtService.sign(
      { sub: user.user_id, user_email: user.user_email },
      { secret: process.env.JWT_ACCESS_KEY, expiresIn: '1h' },
    );
  }

  restoreAccessToken({ user }: IAuthServiceRestoreAccessToken): string {
    return this.getAccessToken({ user });
  }

  setRefreshToken({ user, req, res }: IAuthServiceSetRefreshToken) {
    const refreshToken = this.jwtService.sign(
      { user_email: user.user_email, sub: user.user_id },
      { secret: process.env.JWT_REFRESH_KEY, expiresIn: '2w' },
    );
    // 개발환경
    //res.setHeader('Set-Cookie', `refreshToken=${refreshToken}; path=/`);

    // 배포환경
    const originList = [
      'http://localhost:3000',
      'http://localhost:3000/',
      'http://127.0.0.1:3000',
      'https://doumdattgi.com',
      'https://doumdattgi.com/',
    ];
    const origin = req.headers.origin;
    if (originList.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods', //
      'GET, HEAD, OPTIONS, POST, PUT',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Headers, Origin, Accept, Authorization, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers',
    );

    res.setHeader(
      'Set-Cookie',
      `refreshToken=${refreshToken}; path=/; domain=.doumdattgi-server.com; Secure; httpOnly; SameSite=None;`,
    );
  }

  async verifyLogin({ req, res }) {
    let user = await this.usersService.findOne({
      user_email: req.user.user_email,
    });

    if (!user)
      user = await this.usersService.create({
        createUserInput: {
          ...req.user,
        },
      });
    this.setRefreshToken({ user, req, res });
    res.redirect('https://doumdattgi.com/');
  }

  async logout({ req }: IAuthServiceLogOut) {
    const refreshToken = req.headers.cookie.replace('refreshToken=', '');
    const accessToken = req.headers.authorization.replace('Bearer ', '');

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

  async saveRedis({ accessToken, refreshToken, accessTTL, refreshTTL }) {
    await this.cacheManager.set(`accessToken: ${accessToken}`, accessToken, {
      ttl: accessTTL,
    });
    await this.cacheManager.set(`refreshToken: ${refreshToken}`, refreshToken, {
      ttl: refreshTTL,
    });
  }
}
