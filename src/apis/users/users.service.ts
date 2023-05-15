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
  IUsersServiceUpdateUserInfo,
} from './interfaces/users-service.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sendTokenTemplate } from 'src/commons/utils/utils';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>, //

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly mailerService: MailerService,
  ) {}

  // 이메일 중복여부 확인
  findOneByEmail({ email }: IUsersServiceFindOneByEmail): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  //   토큰 생성
  async createToken() {
    const token = await String(Math.floor(Math.random() * 1000000)).padStart(
      6,
      '0',
    );
    return token;
  }

  // 일치하는 이메일 유무 확인하기
  findOne({ email }: IUsersServiceFindOneByEmail) {
    return this.usersRepository.findOne({ where: { email } });
  }

  // 이메일 중복 검증 및 이메일 인증번호 전송
  async sendTokenEmail({
    email,
  }: IUsersServiceSendTokenEmail): Promise<string> {
    const user = await this.findOneByEmail({ email });
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

    const myToken = await this.cacheManager.get(email);

    if (myToken) {
      await this.cacheManager.del(email);
    }
    await this.cacheManager.set(email, token, {
      ttl: 180,
    });
    return token;
  }

  // 이메일 인증번호 검증
  async checkValidateToken({ email, token }: IUsersServiceCheckToken) {
    const myToken = await this.cacheManager.get(email);
    return myToken === token ? true : false;
  }

  // 회원가입하기
  async createUser({ createUserInput }: ICreateUserInput): Promise<User> {
    const { password, ...userInfo } = createUserInput;
    const hashedPassword = await bcrypt.hash(password, 10);

    return this.usersRepository.save({
      password: hashedPassword,
      ...userInfo,
    });
  }

  // 회원가입
  async create({ createUserInput }: ICreateUserInput): Promise<User> {
    const { email, password, ...userRest } = createUserInput;
    const user = await this.findOneByEmail({ email }); 
    if (user) throw new ConflictException('이미 등록된 이메일입니다.');
    const hashedPassword = await bcrypt.hash(password, 10); 

    return this.usersRepository.save({
      email,
      password: hashedPassword,
      ...userRest,
    });
  }

  // 로그인한 유저 정보 조회
  async findLoginUser({ context }: IUsersServiceFindLoginUser): Promise<User> {
    console.log(context);
    const id = context.req.user.id;

    const loginUserInfo = await this.usersRepository.findOne({ where: { id } });

    return loginUserInfo;
  }

  // 닉네임 및 자기소개 수정
  async updateNicknameIntroduce({
    updateNicknameIntroduceInput, //
    context,
  }: IUsersServiceUpdateNicknameIntroduce): Promise<User> {
    const { nickname, introduce } = updateNicknameIntroduceInput;

    const loginUserInfo = await this.findLoginUser({ context });

    const validateNickname = await this.usersRepository.findOne({
      where: { nickname },
    });

    if (validateNickname) {
      throw new ConflictException('이미 등록된 닉네임입니다.');
    } else {
      const result = await this.usersRepository.save({
        ...loginUserInfo,
        nickname,
        introduce,
      });
      return result;
    }
  }

  // 유저정보 수정 (이름, 이메일, 포트폴리오)
  async updateUserInfo({
    updateUserInfoInput,
    context,
  }: IUsersServiceUpdateUserInfo): Promise<User> {
    const { name, email, portfolio } = updateUserInfoInput;

    const loginUserInfo = await this.findLoginUser({ context });

    return await this.usersRepository.save({
      ...loginUserInfo,
      name,
      email,
      portfolio,
    });
  }

  // 유저 회원탈퇴
  async deleteUser({ context }: IUsersServiceDelete): Promise<boolean> {
    const loginUserId = (await this.findLoginUser({ context })).id;
    const result = await this.usersRepository.softDelete({ id: loginUserId });
    return result.affected ? true : false;
  }
}
