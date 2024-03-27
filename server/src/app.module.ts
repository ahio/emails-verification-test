import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { AppRepository } from './repositories/app.repository';
import { DatabaseModule } from './db/mongodb.module';

@Module({
  imports: [EventEmitterModule.forRoot(), DatabaseModule],
  controllers: [AppController],
  providers: [AppService, AppRepository],
})
export class AppModule {}
