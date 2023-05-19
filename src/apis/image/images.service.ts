import { Injectable } from '@nestjs/common';
import { In, InsertResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from './entites/image.entity';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imagesRepository: Repository<Image>, //
  ) {}

  // findByUrls({ tagUrls2 }): Promise<Image[]> {
  //   return this.imagesRepository.find({
  //     where: { url: In(tagUrls2) },
  //   });
  // }

  // findByIsMains({ tagIsMains }): Promise<Image[]> {
  //   return this.imagesRepository.find({
  //     where: { isMain: In(tagIsMains) },
  //   });
  // }

  // bulkInsert({ urlTemp, isMainTemp }): Promise<InsertResult> {
  //   return this.imagesRepository.insert(urlTemp);
  // }

  // findImageId({ contentId }) {
  //   return this.imagesRepository.find({
  //     relations: ['content'],
  //   });
  // }
}
