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
  user_id: string;
}

export interface IProductServiceFindAll {
  page: number;
  pageSize: number;
}

export interface IProductServiceFindUserAll {
  user_id: string;
  page: number;
  pageSize: number;
}

export interface IProductServiceFindSearch {
  search: string;
  page: number;
  pageSize: number;
}

export interface IProductServiceFindCategory {
  product_category: string;
  page: number;
  pageSize: number;
}

export interface IProductServiceFindSubCategory {
  product_sub_category: string;
  page: number;
  pageSize: number;
}

export interface IProductServiceFindSellProduct {
  product_category: string;
  page: number;
  pageSize: number;
}

export interface IProductServiceFetchMyNotCouponProduct {
  user_id: string;
}
