import { Module } from '@nestjs/common';
import { ServicesModule } from './services.module';
import { AppController } from './controllers/app.controller';
import { EmailController } from './controllers/email.controller';

@Module({
  imports: [ServicesModule],
  controllers: [AppController, EmailController],
})
export class ControllersModule {}
