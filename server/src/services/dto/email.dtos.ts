import { EmailModel, EmailVerificationStatus } from '../../repositories/model/emails.model';

export class EmailItemDto {
  id: string;
  email: string;
  status: EmailVerificationStatus;

  static fromEntity(item: EmailModel): EmailItemDto {
    return {
      id: item.id,
      email: item.email,
      status: item.status,
    };
  }
}