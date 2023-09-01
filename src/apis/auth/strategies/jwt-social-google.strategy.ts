import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

export class JwtGoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://doumdattgi-server.com/login/google',
      scope: ['email', 'profile'],
    });
  }

  validate(_, __, profile) {
    return {
      user_name: profile.displayName,
      user_email: profile.emails[0].value,
      user_provider: profile.provider,
      user_password: '',
      user_nickname: '',
      user_phone: '',
    };
  }
}
