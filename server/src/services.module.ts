import { Module } from '@nestjs/common';
import { EmailService } from './services/email/email.service';
import { EmailQueueProducer } from './queues/producers/emailQueueProducer.service';
import { EmailVerificationService } from './services/email/emailVerification.service';
import { EmailQueueConsumer } from './queues/consumers/emailQueueConsumer.service';
import { EntityModule } from './entity.module';
import { QueueModule } from './queues/queue.module';

@Module({
  imports: [QueueModule, EntityModule],
  providers: [
    EmailService,
    EmailQueueProducer,
    EmailVerificationService,
    EmailQueueConsumer,
  ],
  exports: [
    EmailService,
    EmailQueueProducer,
    EmailVerificationService,
    EmailQueueConsumer,
  ],
})
export class ServicesModule {}
