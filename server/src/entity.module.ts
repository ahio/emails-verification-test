import { Module } from '@nestjs/common';
import { EmailRepository } from './repositories/email.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailEntity } from './repositories/entities/email.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailEntity])],
  providers: [EmailRepository],
  exports: [EmailRepository],
})
export class EntityModule {}
