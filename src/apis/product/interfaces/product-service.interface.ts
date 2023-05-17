import { CreateProductInput } from '../dto/create-product.input';
import { UpdateProductInput } from '../dto/update-product.input';

export interface IProductServiceFindOne {
  productId: string;
}

export interface IProductServiceCreate {
  createProductInput: CreateProductInput;
  user_id: string;
}

export interface IProductServiceUpdate {
  productId: string;
  updateProductInput: UpdateProductInput;
}
