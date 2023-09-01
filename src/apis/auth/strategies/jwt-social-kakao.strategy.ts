import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';

export class JwtKakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET,
      callbackURL: 'https://doumdattgi-server.com/login/kakao',
      scope: ['account_email', 'profile_nickname'],
    });
  }

  validate(_, __, profile) {
    return {
      user_name: profile.displayName,
      user_email: profile._json.kakao_account.email,
      user_provider: profile.provider,
      user_password: '',
      user_nickname: '',
      user_phone: '',
    };
  }
}
