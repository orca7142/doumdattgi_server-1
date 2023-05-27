export interface IPickServiceCreate {
  product_id: string;
  user_id: string;
}

export interface IPickServiceFetchPickUser {
  user_id: string;
  page: number;
  pageSize: number;
}
