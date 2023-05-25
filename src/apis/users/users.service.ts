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
import coolsms from 'coolsms-node-sdk'; //coolsms 불러오기
import { Slot } from '../slot/entites/slot.entity';

const mysms = coolsms; // SDK 가져오기

import 'dotenv/config'; // .env파일 import 하기
const SMS_KEY = process.env.SMS_KEY;
const SMS_SECRET = process.env.SMS_SECRET;
const SMS_SENDER = process.env.SMS_SENDER;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>, //

    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,

    @InjectRepository(Slot)
    private readonly slotsRepository: Repository<Slot>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly mailerService: MailerService,
  ) {}

  // 이메일 중복여부 확인
  findOneByEmail({ user_email }: IUsersServiceFindOneByEmail): Promise<User> {
    return this.usersRepository.findOne({ where: { user_email } });
  }

  // 휴대폰 번호 중복여부 확인
  findOneByPhone({ user_phone }: IUsersServiceFindOneByPhone): Promise<User> {
    return this.usersRepository.findOne({ where: { user_phone } });
  }

  // 토큰 생성
  async createToken() {
    const token = await String(Math.floor(Math.random() * 1000000)).padStart(
      6,
      '0',
    );
    return token;
  }

  // 일치하는 이메일 유무 확인하기
  findOne({ user_email }: IUsersServiceFindOneByEmail) {
    return this.usersRepository.findOne({ where: { user_email } });
  }

  // 이메일 중복 검증 및 이메일 인증번호 전송
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

  // 휴대폰 중복 검증 및 문자 메시지 전송
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

  // 이메일 인증번호 검증
  async checkValidateTokenEMAIL({
    user_email,
    user_token,
  }: IUsersServiceCheckTokenEMAIL) {
    const myToken = await this.cacheManager.get(user_email);
    return myToken === user_token ? true : false;
  }

  // 휴대폰 인증번호 검증
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

  // 비밀번호 찾기 토큰 인증
  async checkValidTokenFindPwdBySMS({
    user_phone,
    user_token,
  }: IUsersServiceCheckTokenSMS): Promise<boolean> {
    const myToken = await this.cacheManager.get(user_phone);
    return myToken === user_token ? true : false;
  }

  // 비밀번호 재설정
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

  // 설정 페이지 비밀번호 재설정
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

  // 회원가입하기
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

  // 회원가입
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

  // 로그인한 유저 정보 조회
  async findLoginUser({ context }: IUsersServiceFindLoginUser): Promise<User> {
    const user_id = context.req.user.user_id;

    const loginUserInfo = await this.usersRepository.findOne({
      where: { user_id },
    });

    return loginUserInfo;
  }

  // 닉네임 및 자기소개 수정
  async updateNicknameIntroduce({
    updateNicknameIntroduceInput, //
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

  // 프로필 이미지 수정
  async updateProfileImage({
    user_url, //
    context,
  }: IUsersServiceUpdateProfileImage): Promise<User> {
    const loginUserInfo = await this.findLoginUser({ context });

    return await this.usersRepository.save({
      ...loginUserInfo,
      user_profileImage: user_url,
    });
  }

  // 유저정보 수정 (이름, 이메일, 포트폴리오)
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

  // 유저 회원탈퇴
  async deleteUser({ context }: IUsersServiceDelete): Promise<boolean> {
    const loginUserId = (await this.findLoginUser({ context })).user_id;
    const result = await this.usersRepository.softDelete({
      user_id: loginUserId,
    });
    return result.affected ? true : false;
  }

  // 로그인 유저 슬롯 조회
  async findUserSlot({
    context, //
  }: IUsersServiceFindLoginUser): Promise<Slot> {
    const user_id = context.req.user.user_id;

    const userSlot = await this.slotsRepository.findOne({
      where: { user: { user_id } },
      relations: ['user'],
    });

    console.log('**********');
    console.log(userSlot);
    console.log('**********');

    if (userSlot === null) {
      return await this.slotsRepository.create({
        user: { user_id },
        slot_first: false,
        slot_second: false,
        slot_third: false,
      });
    }
    return userSlot;
  }
}
