import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER, Inject, UnauthorizedException } from '@nestjs/common';

export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: (req) => {
        const cookie = req.headers.cookie;
        const refreshToken = cookie.replace('refreshToken=', '');
        return refreshToken;
      },
      secretOrKey: process.env.JWT_REFRESH_KEY,
      passReqToCallback: true,
    });
  }

  async validate(req, payload) {
    const reqRefreshToken = req.headers.cookie.replace('refreshToken=', '');
    const blackList = await this.cacheManager.get(
      `refreshToken: ${reqRefreshToken}`,
      reqRefreshToken,
    );

    if (reqRefreshToken === blackList) {
      throw new UnauthorizedException();
    } else {
      return {
        email: payload.email,
        id: payload.sub,
      };
    }
  }
}
