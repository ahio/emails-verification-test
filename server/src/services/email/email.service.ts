import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppRepository } from '../repositories/app.repository';
import { EmailModel, EmailVerificationStatus } from "../repositories/model/Emails.model";

function randomTimeToProcessInSeconds(minSeconds: number = 5, maxSeconds: number = 100) {
  const randomSeconds = (Math.random() * (maxSeconds - minSeconds)) + minSeconds;
  return Math.floor(randomSeconds);
}

function randomEmailVerificationStatus() {
  const random = Math.floor(Math.random() * 2) + 1;
  return random === 1
    ? EmailVerificationStatus.Valid
    : EmailVerificationStatus.Invalid;
}

async function emailVerificationStatusAsync(): Promise<string> {
  const timeInSeconds = randomTimeToProcessInSeconds();

  return new Promise((resolve) => {
    setTimeout(() => {
      const status = randomEmailVerificationStatus();
      resolve(status);
    }, timeInSeconds * 1000);
  });
}

async function mockedEmailVerification(email: string): Promise<string> {
  return await emailVerificationStatusAsync();
}

@Injectable()
export class AppService {
  private readonly emailVerificationLimit: number;
  private processingEmailIds: Set<string>;

  constructor(
    private readonly repository: AppRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.emailVerificationLimit = process.env.VERIFY_EMAIL_LIMIT && parseInt(process.env.VERIFY_EMAIL_LIMIT);
    this.processingEmailIds = new Set();
  }

  private async verifyEmails(): Promise<void> {
    if (this.processingEmailIds.size >= this.emailVerificationLimit) {
      return;
    }

    const size = this.emailVerificationLimit - this.processingEmailIds.size;
    const emails = await this.repository.getNextEmailsToVerify(size);

    if (!emails.length) {
      this.processingEmailIds.clear();
      return;
    }

    for (let i = 0; i < emails.length; i++) {
      const emailData = emails[i];
      const id = emailData.id;

      if (!this.processingEmailIds.has(id)) {
        this.processingEmailIds.add(id);

        mockedEmailVerification(emailData.email)
          .then((status: string) => {
            return this.repository.updateEmailStatus(emailData.id, status);
          })
          .then(({ id, email, status }) => {
            this.processingEmailIds.delete(id);
            this.eventEmitter.emit('emails.email_verification', { id, email, status });
            this.verifyEmails().then(null);
          })
          .catch((err) => {
            // if email verification failed - stop processing.
            // TODO: implement manual restart for email verification process
            this.processingEmailIds.clear();
            console.error(err);
          });
      }
    }
  }

  async saveEmails(dto: { emails: string[] }): Promise<EmailModel[]> {
    const emailsExists = await this.repository.checkEmailsExists(dto.emails);
    if (emailsExists) {
      throw new HttpException('Emails exists', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.repository.saveEmails(dto.emails);
      const emails = await this.repository.getEmails(dto.emails);

      this.verifyEmails().then(null);

      return emails;
    } catch (err) {
      console.error(err);
      throw new Error('Failed to save emails');
    }
  }

  async getEmails(): Promise<EmailModel[]> {
    try {
      return await this.repository.getEmails();
    } catch (err) {
      console.error(err);
      throw new Error('Failed to fetch emails');
    }
  }
}
