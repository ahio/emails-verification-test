import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailEntity } from '../repositories/entities/email.entity.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mongodb',
        host: process.env.DB_HOSTNAME,
        port: parseInt(process.env.DB_PORT),
        database: 'db-test',
        synchronize: false,
        maxQueryExecutionTime: 1000, // this setting will log slow queries
        logging: ['warn', 'error'],
        entities: [EmailEntity],
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
