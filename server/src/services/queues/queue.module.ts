import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'emails',
      useFactory: async () => ({
        redis: {
          host: process.env.REDIS_HOSTNAME,
          port: parseInt(process.env.REDIS_PORT),
        },
      }),
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
