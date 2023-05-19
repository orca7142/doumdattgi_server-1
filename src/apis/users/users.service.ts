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
  IUsersServiceCheckToken,
  IUsersServiceDelete,
  IUsersServiceFindLoginUser,
  IUsersServiceFindOneByEmail,
  IUsersServiceSendTokenEmail,
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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>, //

    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly mailerService: MailerService,
  ) {}

  // 이메일 중복여부 확인
  findOneByEmail({ user_email }: IUsersServiceFindOneByEmail): Promise<User> {
    return this.usersRepository.findOne({ where: { user_email } });
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
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
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

  // 이메일 인증번호 검증
  async checkValidateToken({
    user_email,
    user_token,
  }: IUsersServiceCheckToken) {
    const myToken = await this.cacheManager.get(user_email);
    return myToken === user_token ? true : false;
  }

  // 회원가입하기
  async createUser({ createUserInput }: ICreateUserInput): Promise<User> {
    const { user_password, ...userInfo } = createUserInput;
    const hashedPassword = await bcrypt.hash(user_password, 10);

    return this.usersRepository.save({
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

    const validateNickname = await this.usersRepository.findOne({
      where: { user_nickname },
    });

    if (validateNickname) {
      throw new ConflictException('이미 등록된 닉네임입니다.');
    } else {
      const result = await this.usersRepository.save({
        ...loginUserInfo,
        user_nickname,
        user_introduce,
      });
      return result;
    }
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

  // 로그인한 유저 결제 정보 조회
  async findUserPaymentInfo({
    context,
  }: IUsersServiceFindLoginUser): Promise<Payment[]> {
    const user_id = context.req.user.user_id;

    const paymentInfo = await this.paymentsRepository.find({
      where: { user: { user_id } },
    });
    return paymentInfo;
  }
}
