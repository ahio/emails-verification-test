import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Sse,
} from '@nestjs/common';
import { Observable, fromEvent, map } from 'rxjs';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppService } from '../services/app.service';
import { EmailsValidation } from './validation/emails.validation';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Sse('email-verification-status/sse')
  emailVerificationStatusSSE(): Observable<MessageEvent> {
    return fromEvent(this.eventEmitter, 'emails.email_verification').pipe(
      map((data) => {
        return new MessageEvent('email_verification', { data });
      }),
    );
  }

  @Get('emails')
  @HttpCode(HttpStatus.OK)
  async getEmailsList() {
    return await this.appService.getEmails();
  }

  @Post('emails/bulk')
  @HttpCode(HttpStatus.OK)
  async emailsBulk(@Body() body: { emails: [string] }) {
    const dto = {
      emails: EmailsValidation.validateBulk(body.emails, 'emails'),
    };

    return await this.appService.saveEmails(dto);
  }
}
