import { Processor, Process, OnQueueError } from '@nestjs/bull';
import { Job } from 'bull';
import { EmailVerificationService } from '../../email/emailVerification.service.js';
import { Logger } from '@nestjs/common';

@Processor('emails')
export class EmailQueueConsumer {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @OnQueueError({ name: 'verify_email' })
  onError(error: Error) {
    Logger.error(error);
  }

  @Process({
    name: 'verify_email',
    concurrency: parseInt(process.env.VERIFY_EMAIL_LIMIT),
  })
  async verifyEmail(job: Job<{ name: string; email: string }>) {
    const { email } = job.data;
    await this.emailVerificationService.processEmailVerification(email);
  }
}
