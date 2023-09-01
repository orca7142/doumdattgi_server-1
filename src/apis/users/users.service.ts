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

  // 이메일 이미 존재하는지 확인하는 함수
  findOneByEmail({ user_email }: IUsersServiceFindOneByEmail): Promise<User> {
    return this.usersRepository.findOne({ where: { user_email } });
  }

  // 휴대폰 번호 이미 존재하는지 확인하는 함수
  findOneByPhone({ user_phone }: IUsersServiceFindOneByPhone): Promise<User> {
    return this.usersRepository.findOne({ where: { user_phone } });
  }

  // 토큰 생성 함수
  async createToken(): Promise<string> {
    const token = await String(Math.floor(Math.random() * 1000000)).padStart(
      6,
      '0',
    );
    return token;
  }

  // 이메일로 유저 찾는 함수
  findOne({ user_email }: IUsersServiceFindOneByEmail): Promise<User> {
    return this.usersRepository.findOne({ where: { user_email } });
  }

  // 이메일 형식 검증 함수
  validateEmail({ user_email }) {
    if (!user_email.includes('@')) {
      throw new ConflictException('이매일의 형식이 잘못되었습니다');
    }
    const splitEmail = user_email.split('@');
    if (splitEmail[0].length > 64 || splitEmail[1].length > 255) {
      throw new ConflictException('이매일의 길이가 최대길이를 초과하였습니다');
    }
  }

  // 비밀번호 형식 검증 함수
  validatePassword({ user_password }) {
    const regPwd = /^[a-z0-9_]{4,20}$/;
    if (user_password.length < 8 || user_password > 16) {
      throw new ConflictException(
        '비밀번호의 길이가 8 ~ 16 자리를 만족하지 않습니다',
      );
    } else if (!regPwd.test(user_password)) {
      throw new ConflictException(
        '비밀번호가 영문과 숫자를 모두 포함하고 있지 않습니다',
      );
    }
  }

  // 닉네임 형식 검증 함수
  async validateNickname({ user_nickname }) {
    if (user_nickname.length < 2 || user_nickname.length > 15) {
      throw new ConflictException('닉네임이 길이 조건에 부합하지 않습니다');
    }
    const findNickname = await this.usersRepository.findOne({
      where: { user_nickname },
    });
    if (findNickname) {
      throw new ConflictException('입력하신 닉네임이 이미 존재합니다');
    }
  }

  // 휴대폰 번호 형식 검증 함수
  validatePhone({ user_phone }) {
    const regPhone = /^01([0|1|6|7|8|9])([0-9]{3,4})([0-9]{4})$/;
    if (!regPhone.test(user_phone)) {
      throw new ConflictException('휴대폰 번호 형식이 잘못되었습니다');
    }
  }

  // 이메일 인증번호 전송 함수
  async sendTokenEmail({
    user_email,
  }: IUsersServiceSendTokenEmail): Promise<string> {
    this.validateEmail({ user_email });

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

  // 문자 인증번호 전송 함수
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

  // 이메일 인증번호 검증 함수
  async checkValidateTokenEMAIL({
    user_email,
    user_token,
  }: IUsersServiceCheckTokenEMAIL): Promise<boolean> {
    const myToken = await this.cacheManager.get(user_email);
    return myToken === user_token ? true : false;
  }

  // 문자 인증번호 인증 이후 이메일 찾는 함수
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

  // 문자 인증번호 검증 함수
  async checkValidTokenFindPwdBySMS({
    user_phone,
    user_token,
  }: IUsersServiceCheckTokenSMS): Promise<boolean> {
    const myToken = await this.cacheManager.get(user_phone);
    return myToken === user_token ? true : false;
  }

  // 비밀번호 초기화 함수
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

  // 설정 페이지 비밀번호 변경 함수
  async resetPasswordSettingPage({
    password,
    new_password,
    context,
  }: IUsersServiceResetPasswordSettingPage): Promise<boolean> {
    // todo 기존 비밀번호 검증
    const user = await this.findLoginUser({ context });
    const user_password = user.user_password;
    const check = await bcrypt.compare(password, user_password);
    if (!check)
      throw new ConflictException('기존 비밀번호가 일치하지 않습니다.');

    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    const user_id = user.user_id;
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

  // 회원가입 함수
  async createUser({ createUserInput }: ICreateUserInput): Promise<User> {
    const { user_password, user_email, user_phone, user_nickname, user_name } =
      createUserInput;

    this.validatePassword({ user_password });
    this.validateNickname({ user_nickname });
    this.validatePhone({ user_phone });

    const validatePhone = await this.findOneByPhone({ user_phone });
    const validateEmail = await this.findOneByEmail({ user_email });

    await this.validateNickname({ user_nickname });

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
      user_nickname,
      user_name,
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

  // 로그인한 유저 정보 조회 함수
  async findLoginUser({ context }: IUsersServiceFindLoginUser): Promise<User> {
    const user_id = context.req.user.user_id;

    const loginUserInfo = await this.usersRepository.findOne({
      where: { user_id },
    });

    return loginUserInfo;
  }

  // 닉네임 또는 자기소개 수정 함수
  async updateNicknameIntroduce({
    updateNicknameIntroduceInput,
    context,
  }: IUsersServiceUpdateNicknameIntroduce): Promise<User> {
    const { user_nickname, user_introduce } = updateNicknameIntroduceInput;

    const loginUserInfo = await this.findLoginUser({ context });
    const loginUserNickname = loginUserInfo.user_nickname;
    if (loginUserNickname !== user_nickname) {
      await this.validateNickname({ user_nickname });
    }
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

  // 프로필 이미지 수정 함수
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

  // 유저정보 수정 함수
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

  // 회원 탈퇴 함수
  async deleteUser({ context }: IUsersServiceDelete): Promise<boolean> {
    const loginUserId = (await this.findLoginUser({ context })).user_id;
    const result = await this.usersRepository.softDelete({
      user_id: loginUserId,
    });
    return result.affected ? true : false;
  }

  // 유저 슬롯 조회 함수
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
