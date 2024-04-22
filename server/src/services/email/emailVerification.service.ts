import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailQueueProducer } from '../../queues/producers/emailQueueProducer.service.js';
import { fakeEmailVerificationStatus } from '../utils/email.js';
import { EmailRepository } from '../../repositories/email.repository';
import { fromEvent, map, Observable } from 'rxjs';
import { EmailItemDto } from '../dto/email.dtos';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly emailRepository: EmailRepository,
    private readonly emailQueue: EmailQueueProducer,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private async mockedEmailVerification(email: string) {
    const status = await fakeEmailVerificationStatus();
    const updatedEmail = await this.emailRepository.updateEmailStatus(email, status);
    this.eventEmitter.emit('emails.email_verification', EmailItemDto.fromEntity(updatedEmail));
  }

  async processEmailVerification(email: string) {
    await this.mockedEmailVerification(email);
  }

  async addEmailsToVerify(emails: any[]) {
    const jobs = emails.map((email) => {
      return {
        name: 'verify_email',
        data: { email },
      };
    });
    await this.emailQueue.add(jobs);
  }

  getEmailVerificationUpdates(): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, 'emails.email_verification')
      .pipe(map((data: EmailItemDto) => new MessageEvent('email_verification', { data })));
  }
}
