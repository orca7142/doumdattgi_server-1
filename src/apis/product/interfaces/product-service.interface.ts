import { CreateProductInput } from '../dto/create-product.input';
import { UpdateProductInput } from '../dto/update-product.input';

export interface IProductServiceFindOne {
  product_id: string;
}

export interface IProductServiceCreate {
  createProductInput: CreateProductInput;
  user_id: string;
}

export interface IProductServiceUpdate {
  product_id: string;
  updateProductInput: UpdateProductInput;
}

export interface IProductServiceDelete {
  product_id: string;
}
