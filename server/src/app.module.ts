import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from './db/db.module.js';
import { ControllersModule } from './controllers.module';

@Module({
  imports: [EventEmitterModule.forRoot(), DatabaseModule, ControllersModule],
})
export class AppModule {}
