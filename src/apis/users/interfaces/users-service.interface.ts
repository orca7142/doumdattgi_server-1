import { IContext } from 'src/commons/interfaces/context';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserInfoInput } from '../dto/update-userInfo.input';
import { UpdateNicknameIntroduceInput } from '../dto/update-nicknameIntroduce.input';

export interface ICreateUserInput {
  createUserInput: CreateUserInput;
  user_provider?: string;
}

export interface IUsersServiceDuplicationEmail {
  user_email: string;
}

export interface IUsersServiceFindOneByEmail {
  user_email: string;
}

export interface IUsersServiceFindOneByPhone {
  user_phone: string;
}

export interface IUsersServiceSendTokenEmail {
  user_email: string;
}

export interface IUsersServiceCheckTokenEMAIL {
  user_email: string;
  user_token: string;
}

export interface IUsersServiceCheckTokenSMS {
  user_phone: string;
  user_token: string;
}

export interface IUsersServiceDelete {
  context: IContext;
}

export interface IUsersServiceFindLoginUser {
  context: IContext;
}

export interface IUsersServiceUpdateUserInfo {
  context: IContext;
  updateUserInfoInput: UpdateUserInfoInput;
}

export interface IUsersServiceUpdateNicknameIntroduce {
  context: IContext;
  updateNicknameIntroduceInput: UpdateNicknameIntroduceInput;
}

export interface IUsersServiceUpdateProfileImage {
  context: IContext;
  user_url: string;
}

export interface IUsersServiceSendTokenSMS {
  user_phone: string;
}

export interface IUsersServiceResetPassword {
  user_phone: string;
  new_password: string;
}

export interface IUsersServiceResetPasswordSettingPage {
  password: string;
  new_password: string;
  context: IContext;
}
