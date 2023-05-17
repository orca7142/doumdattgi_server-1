import { Module } from '@nestjs/common';
import { ImagesService } from './images.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entites/image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Image, //
    ]),
  ],
  providers: [
    ImagesService, //
  ],
})
export class ImagesModule {}
