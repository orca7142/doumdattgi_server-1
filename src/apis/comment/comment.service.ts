import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICommentServiceCreate } from './interfaces/comment-service.interface';
import { Request } from '../request/entites/request.entity';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,

    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  // 댓글 생성하기
  async createComment({
    createCommentInput,
  }: ICommentServiceCreate): Promise<boolean> {
    const { request_id, sender_id, text } = createCommentInput;
    const user = await this.requestsRepository.findOne({
      where: { request_id },
    });
    const seller_id = user.seller_id;
    const buyer_id = user.buyer_id;
    if (sender_id === seller_id) {
      await this.commentsRepository.save({
        request: { request_id },
        comment_text: text,
        sender_id,
        user: { user_id: buyer_id },
      });
      return true;
    } else if (sender_id === buyer_id) {
      await this.commentsRepository.save({
        request: { request_id },
        comment_text: text,
        sender_id,
        user: { user_id: seller_id },
      });
      return true;
    }
    return false;
  }

  // 댓글 조회하기
  async findComments({ request_id, user_id }): Promise<Comment[]> {
    const userInfo = await this.requestsRepository.findOne({
      where: { request_id },
    });

    const seller_id = userInfo.seller_id;
    const buyer_id = userInfo.buyer_id;

    console.log('**********');
    console.log(user_id);
    console.log('**********');
    console.log('**********');
    console.log(userInfo);
    console.log('**********');

    if (user_id === seller_id) {
      user_id = buyer_id;
      return await this.commentsRepository.find({
        where: { request: { request_id } },
        relations: ['user', 'request'],
        order: { comment_createdAt: 'DESC' },
      });
    } else if (user_id === buyer_id) {
      user_id = seller_id;
      return await this.commentsRepository.find({
        where: { request: { request_id } },
        relations: ['user', 'request'],
        order: { comment_createdAt: 'DESC' },
      });
    }
  }
}
