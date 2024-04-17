import { Body, Controller, Get, HttpCode, HttpStatus, Post, Sse } from '@nestjs/common';
import { EmailService } from '../services/email/email.service.js';
import { Observable } from 'rxjs';
import { EmailsValidation } from './validation/emails.validation.js';
import { EmailVerificationService } from '../services/email/emailVerification.service';

@Controller('emails')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Sse('verification-status/sse')
  emailVerificationStatusSSE(): Observable<MessageEvent> {
    return this.emailVerificationService.getEmailVerificationUpdates();
  }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  async getEmailsList() {
    return await this.emailService.getEmails();
  }

  @Post('bulk')
  @HttpCode(HttpStatus.OK)
  async emailsBulk(@Body() body: { emails: [string] }) {
    const dto = {
      emails: EmailsValidation.validateBulk(body.emails, 'emails'),
    };

    return await this.emailService.saveEmails(dto);
  }
}
