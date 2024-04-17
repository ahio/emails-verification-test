export enum EmailVerificationStatus {
  Valid = 'valid',
  Invalid = 'invalid',
  Validating = 'validating',
}

export class EmailModel {
  id: string;
  email: string;
  status: EmailVerificationStatus;
  createdAt?: Date;
  updatedAt?: Date;

  static fromRaw(rawData): EmailModel {
    return {
      id: rawData._id.toString(),
      email: rawData.email,
      status: rawData.status,
    };
  }
}

export class EmailToVerifyModel {
  id: string;
  email: string;

  static fromRaw(rawData): EmailToVerifyModel {
    return {
      id: rawData._id.toString(),
      email: rawData.email,
    };
  }
}