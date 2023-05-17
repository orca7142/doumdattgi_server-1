import { CACHE_MANAGER, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Cache } from 'cache-manager';

export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_KEY,
      passReqToCallback: true,
    });
  }

  async validate(req, payload) {
    const reqAccessToken = req.headers.authorization.replace('Bearer ', '');
    const blackList = await this.cacheManager.get(
      `accessToken: ${reqAccessToken}`,
    );
    if (reqAccessToken === blackList) {
      throw new UnauthorizedException();
    } else {
      return {
        // email: payload.email,
        id: payload.sub,
      };
    }
  }
}
