import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailQueueProducer {
  constructor(@InjectQueue('emails') private emailQueue: Queue) {}

  async add(jobs: any[]) {
    await this.emailQueue.addBulk(jobs);
  }
}
