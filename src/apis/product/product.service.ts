import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entites/product.entity';
import { Repository } from 'typeorm';
import { CreateProductInput } from './dto/create-product.input';

// @Injectable()
// export class ProductService {
//   constructor(
//     @InjectRepository(Product)
//     private readonly productRepository: Repository<Product>,

//     private readonly userService: UserService
//   ) {}
// }

//  create({createProductInput}: CreateProductInput):Promise<Product>{
// const {user, ...product} = createProductInput

// return
// }
