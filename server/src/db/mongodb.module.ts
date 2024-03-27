import { Module } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';

async function initMongoDbConnection(): Promise<Db> {
  const dbHostName = process.env.DB_HOSTNAME;
  const dbPort = process.env.DB_PORT;
  const connectionLink = `mongodb://${dbHostName}:${dbPort}`;

  try {
    const client = await MongoClient.connect(connectionLink);
    const db = client.db('db-test');

    const emailCollectionExist = await db.listCollections({ name: 'emails' }, { nameOnly: true }).toArray();

    if (!emailCollectionExist.length) {
      await db.createCollection('emails', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            title: 'Email object validation',
            required: ['email', 'status', 'createdAt'],
            properties: {
              email: {
                bsonType: 'string',
                description: '[email] must be a string and is required',
              },
              status: {
                enum: ['validating', 'valid', 'invalid'],
                description: '[status] must be a string and is required',
              },
              createdAt: {
                bsonType: 'date',
                description: '[createdAt] must be a Date and is required',
              },
              updatedAt: {
                bsonType: 'date',
                description: '[updatedAt] must be a string',
              },
            },
          },
        },
      });
    }

    return db;
  } catch (e) {
    throw e;
  }
}

@Module({
  providers: [
    {
      provide: 'DB_CONNECTION',
      useFactory: initMongoDbConnection,
    },
  ],
  exports: ['DB_CONNECTION'],
})
export class DatabaseModule {}
