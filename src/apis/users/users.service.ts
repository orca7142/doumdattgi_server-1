import {
  CACHE_MANAGER,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { User } from './entities/user.entity';
import {
  ICreateUserInput,
  IUsersServiceCheckTokenEMAIL,
  IUsersServiceCheckTokenSMS,
  IUsersServiceDelete,
  IUsersServiceFindLoginUser,
  IUsersServiceFindOneByEmail,
  IUsersServiceFindOneByPhone,
  IUsersServiceResetPassword,
  IUsersServiceResetPasswordSettingPage,
  IUsersServiceSendTokenEmail,
  IUsersServiceSendTokenSMS,
  IUsersServiceUpdateNicknameIntroduce,
  IUsersServiceUpdateProfileImage,
  IUsersServiceUpdateUserInfo,
} from './interfaces/users-service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sendTokenTemplate } from 'src/commons/utils/utils';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';
import { Payment } from '../payment/entities/payment.entity';
import coolsms from 'coolsms-node-sdk';
import { Slot } from '../slot/entites/slot.entity';

const mysms = coolsms;

import 'dotenv/config';
const SMS_KEY = process.env.SMS_KEY;
const SMS_SECRET = process.env.SMS_SECRET;
const SMS_SENDER = process.env.SMS_SENDER;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,

    @InjectRepository(Slot)
    private readonly slotsRepository: Repository<Slot>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly mailerService: MailerService,
  ) {}

  findOneByEmail({ user_email }: IUsersServiceFindOneByEmail): Promise<User> {
    return this.usersRepository.findOne({ where: { user_email } });
  }

  findOneByPhone({ user_phone }: IUsersServiceFindOneByPhone): Promise<User> {
    return this.usersRepository.findOne({ where: { user_phone } });
  }

  async createToken(): Promise<string> {
    const token = await String(Math.floor(Math.random() * 1000000)).padStart(
      6,
      '0',
    );
    return token;
  }

  findOne({ user_email }: IUsersServiceFindOneByEmail): Promise<User> {
    return this.usersRepository.findOne({ where: { user_email } });
  }

  async sendTokenEmail({
    user_email,
  }: IUsersServiceSendTokenEmail): Promise<string> {
    const user = await this.findOneByEmail({ user_email });
    if (user) {
      throw new ConflictException('이미 등록된 이메일입니다');
    }
    const token = await this.createToken();

    await this.mailerService.sendMail({
      from: process.env.EMAIL_SENDER,
      to: user_email,
      subject: '[도움닫기] 가입 인증 번호입니다.',
      html: sendTokenTemplate({ token }),
    });

    const myToken = await this.cacheManager.get(user_email);

    if (myToken) {
      await this.cacheManager.del(user_email);
    }
    await this.cacheManager.set(user_email, token, {
      ttl: 180,
    });
    return token;
  }

  async sendTokenSMS({
    user_phone,
  }: IUsersServiceSendTokenSMS): Promise<string> {
    const user = await this.findOneByPhone({ user_phone });
    if (!user) {
      throw new ConflictException('등록되지 않은 휴대폰번호 입니다');
    }
    const token = await this.createToken();

    const messageService = new mysms(SMS_KEY, SMS_SECRET);
    await messageService.sendOne({
      autoTypeDetect: true,
      to: user_phone,
      from: SMS_SENDER,
      text: `안녕하세요!! 인증번호는 ${token}입니다!!`,
    });

    const myToken = await this.cacheManager.get(user_phone);

    if (myToken) {
      await this.cacheManager.del(user_phone);
    }
    await this.cacheManager.set(user_phone, token, {
      ttl: 180,
    });
    return token;
  }

  async checkValidateTokenEMAIL({
    user_email,
    user_token,
  }: IUsersServiceCheckTokenEMAIL): Promise<boolean> {
    const myToken = await this.cacheManager.get(user_email);
    return myToken === user_token ? true : false;
  }

  async checkValidTokenFindEmailBySMS({
    user_phone,
    user_token,
  }: IUsersServiceCheckTokenSMS): Promise<string> {
    const myToken = await this.cacheManager.get(user_phone);
    if (myToken === user_token) {
      const findEmail = (await this.findOneByPhone({ user_phone })).user_email;
      return findEmail;
    } else {
      throw new ConflictException('일치하는 이메일이 없습니다');
    }
  }

  async checkValidTokenFindPwdBySMS({
    user_phone,
    user_token,
  }: IUsersServiceCheckTokenSMS): Promise<boolean> {
    const myToken = await this.cacheManager.get(user_phone);
    return myToken === user_token ? true : false;
  }

  async resetPassword({
    user_phone,
    new_password,
  }: IUsersServiceResetPassword): Promise<boolean> {
    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    const user_id = (await this.findOneByPhone({ user_phone })).user_id;
    const resetPwd = await this.usersRepository.update(
      {
        user_id,
      },
      {
        user_password: hashedNewPassword,
      },
    );
    return resetPwd ? true : false;
  }

  async resetPasswordSettingPage({
    new_password,
    context,
  }: IUsersServiceResetPasswordSettingPage): Promise<boolean> {
    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    const user_id = context.req.user.user_id;
    const resetPwd = await this.usersRepository.update(
      {
        user_id,
      },
      {
        user_password: hashedNewPassword,
      },
    );
    return resetPwd ? true : false;
  }

  async createUser({ createUserInput }: ICreateUserInput): Promise<User> {
    const { user_password, user_email, user_phone, ...userInfo } =
      createUserInput;
    const validatePhone = await this.findOneByPhone({ user_phone });
    const validateEmail = await this.findOneByEmail({ user_email });

    if (validatePhone) {
      throw new ConflictException('이미 등록된 휴대폰 번호입니다.');
    } else if (validateEmail) {
      throw new ConflictException('이미 등록된 이메일입니다.');
    }

    const hashedPassword = await bcrypt.hash(user_password, 10);

    return this.usersRepository.save({
      user_email,
      user_phone,
      user_password: hashedPassword,
      ...userInfo,
    });
  }

  async create({ createUserInput }: ICreateUserInput): Promise<User> {
    const { user_email, user_password, ...userRest } = createUserInput;
    const user = await this.findOneByEmail({ user_email });
    if (user) throw new ConflictException('이미 등록된 이메일입니다.');
    const hashedPassword = await bcrypt.hash(user_password, 10);

    return this.usersRepository.save({
      user_email,
      user_password: hashedPassword,
      ...userRest,
    });
  }

  async findLoginUser({ context }: IUsersServiceFindLoginUser): Promise<User> {
    const user_id = context.req.user.user_id;

    const loginUserInfo = await this.usersRepository.findOne({
      where: { user_id },
    });

    return loginUserInfo;
  }

  async updateNicknameIntroduce({
    updateNicknameIntroduceInput,
    context,
  }: IUsersServiceUpdateNicknameIntroduce): Promise<User> {
    const { user_nickname, user_introduce } = updateNicknameIntroduceInput;

    const loginUserInfo = await this.findLoginUser({ context });

    await this.usersRepository.save({
      ...loginUserInfo,
      user_nickname,
      user_introduce,
    });

    const result = await this.usersRepository.findOne({
      where: { user_id: loginUserInfo.user_id },
    });
    return result;
  }

  async updateProfileImage({
    user_url,
    context,
  }: IUsersServiceUpdateProfileImage): Promise<User> {
    const loginUserInfo = await this.findLoginUser({ context });

    return await this.usersRepository.save({
      ...loginUserInfo,
      user_profileImage: user_url,
    });
  }

  async updateUserInfo({
    updateUserInfoInput,
    context,
  }: IUsersServiceUpdateUserInfo): Promise<User> {
    const { user_name, user_email, user_portfolio } = updateUserInfoInput;

    const loginUserInfo = await this.findLoginUser({ context });

    return await this.usersRepository.save({
      ...loginUserInfo,
      user_name,
      user_email,
      user_portfolio,
    });
  }

  async deleteUser({ context }: IUsersServiceDelete): Promise<boolean> {
    const loginUserId = (await this.findLoginUser({ context })).user_id;
    const result = await this.usersRepository.softDelete({
      user_id: loginUserId,
    });
    return result.affected ? true : false;
  }

  async findUserSlot({ context }: IUsersServiceFindLoginUser): Promise<Slot> {
    const user_id = context.req.user.user_id;

    const userSlot = await this.slotsRepository.findOne({
      where: { user: { user_id } },
      relations: ['user'],
    });

    if (userSlot === null) {
      const createSlot = this.slotsRepository.create({
        user: { user_id },
        slot_first: false,
        slot_second: false,
        slot_third: false,
      });
      const saveSlot = await this.slotsRepository.save({
        ...createSlot,
      });
      return saveSlot;
    }
    return userSlot;
  }
}
