import { IContext } from 'src/commons/interfaces/context';
import { CreateUserInput } from '../dto/create-user.input';
import { UpdateUserInfoInput } from '../dto/update-userInfo.input';
import { UpdateNicknameIntroduceInput } from '../dto/update-nicknameIntroduce.input';

export interface ICreateUserInput {
  createUserInput: CreateUserInput;
}

export interface IUsersServiceDuplicationEmail {
  user_email: string;
}

export interface IUsersServiceFindOneByEmail {
  user_email: string;
}

export interface IUsersServiceSendTokenEmail {
  user_email: string;
}

export interface IUsersServiceCheckToken {
  user_email: string;
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
