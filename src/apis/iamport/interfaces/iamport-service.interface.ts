export interface IIamportServiceCheckpaid {
  payment_impUid: string;
  payment_amount: number;
}

export interface IIamportServiceCancel {
  payment_impUid: string;
}
