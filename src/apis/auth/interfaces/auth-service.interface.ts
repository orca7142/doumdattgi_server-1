import { User } from 'src/apis/users/entities/user.entity';
import { IAuthUser, IContext } from 'src/commons/interfaces/context';

export interface IAuthServiceLogin {
  user_email: string;
  user_password: string;
  context: IContext;
}

export interface IAuthServiceLogOut {
  req: IContext['req'];
}

export interface IAuthServiceGetAccessToken {
  user: User | IAuthUser['user'];
}

export interface IAuthServiceSetRefreshToken {
  user: User;
  req?: IContext['req'];
  res?: IContext['res'];
}

export interface IAuthServiceRestoreAccessToken {
  user: IAuthUser['user'];
}

export interface IOAuthUser {
  user: {
    user_name: string;
    user_email: string;
    user_provider: string;
    user_password: string;
    user_nickname: string;
    user_phone: string;
  };
}
