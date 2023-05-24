import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICommentServiceCreate } from './interfaces/comment-service.interface';
import { Request } from '../request/entites/request.entity';
import { Comment } from './entities/comment.entity';
import { FindCommentsOutput } from './dto/findComments.output';

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
  }: ICommentServiceCreate): Promise<Comment> {
    const { request_id, sender_id, text } = createCommentInput;
    return await this.commentsRepository.save({
      request: { request_id },
      comment_text: text,
      comment_sellerOrBuyer: sender_id,
    });
  }

  // 댓글 조회하기
  async findComments({ request_id }): Promise<FindCommentsOutput[]> {
    const result = await this.commentsRepository
      .createQueryBuilder('comment')
      .innerJoin(
        'comment.request',
        'r',
        'comment.requestRequestId = r.request_Id',
      )
      .select([
        'comment.comment_id',
        'r.request_id',
        'comment.comment_text',
        'comment.comment_sellerOrBuyer',
        'comment.comment_createdAt',
      ])
      .where('r.request_id = :request_id', { request_id })
      .orderBy('comment.comment_createdAt', 'ASC')
      .getRawMany();

    return result;
  }
}
