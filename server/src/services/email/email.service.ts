import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EmailRepository } from '../../repositories/email.repository';
import { EmailModel } from '../../repositories/model/emails.model.js';
import { EmailVerificationService } from './emailVerification.service.js';
import { EmailItemDto } from '../dto/email.dtos';

@Injectable()
export class EmailService {
  constructor(
    private readonly repository: EmailRepository,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  async saveEmails(dto: { emails: string[] }): Promise<EmailModel[]> {
    const emailsExists = await this.repository.checkEmailsExists(dto.emails);
    if (emailsExists) {
      throw new HttpException('Emails exists', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.repository.saveEmails(dto.emails);
    } catch (err) {
      Logger.error(err.message);
      throw new Error('Failed to save emails');
    }

    await this.emailVerificationService.addEmailsToVerify(dto.emails);
    const emails = await this.repository.getEmails(dto.emails);
    return emails.map((item) => EmailItemDto.fromEntity(item));
  }

  async getEmails(): Promise<EmailItemDto[]> {
    try {
      const emails = await this.repository.getEmails();
      return emails.map((item) => EmailItemDto.fromEntity(item));
    } catch (err) {
      Logger.error(err.message);
      throw new Error('Failed to fetch emails');
    }
  }
}
