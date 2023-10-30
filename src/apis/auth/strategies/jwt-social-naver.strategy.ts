import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-naver';

export class JwtNaverStrategy extends PassportStrategy(Strategy, 'naver') {
  constructor() {
    super({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: 'https://doumdattgi-server.com/login/naver',
    });
  }

  validate(_, __, profile) {
    return {
      user_name: profile.displayName,
      user_email: profile._json.email,
      user_provider: profile.provider,
      user_password: '',
      user_nickname: 'profile.displayName',
      user_phone: '',
    };
  }
}
