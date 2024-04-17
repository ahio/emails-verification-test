import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId, ReturnDocument } from 'mongodb';
import { MongoRepository } from 'typeorm';
import {
  EmailModel,
  EmailToVerifyModel,
  EmailVerificationStatus,
} from './model/emails.model.js';
import { EmailEntity } from './entities/email.entity.js';

@Injectable()
export class AppRepository {
  constructor(
    @InjectRepository(EmailEntity) private readonly emailCollection: MongoRepository<EmailEntity>,
  ) {}

  async saveEmails(emails: string[]): Promise<void> {
    const emailsToInsert = emails.map((emailName) => {
      const entity = new EmailEntity();
      entity._id = new ObjectId();
      entity.email = emailName;
      entity.status = EmailVerificationStatus.Validating;
      entity.createdAt = new Date();

      return entity;
    });

    await this.emailCollection.insertMany(emailsToInsert);
  }

  async updateEmailStatus(email: string, status: string): Promise<EmailModel> {
    const query = { email };
    const propsToUpdate = { $set: { status } };
    const options = {
      returnDocument: ReturnDocument.AFTER,
      projection: { _id: 1, email: 1, status: 1 },
    };
    const updatedEmail = await this.emailCollection.findOneAndUpdate(query, propsToUpdate, options);

    if (!updatedEmail.ok) {
      throw new Error('Email repository: Failed to update email status');
    }

    return EmailModel.fromRaw(updatedEmail.value);
  }

  async getNextEmailsToVerify(size: number): Promise<EmailToVerifyModel[]> {
    const query = { status: 'validating' };
    const params = {
      where: query,
      take: size
    };
    const emails = await this.emailCollection.find(params);
    return emails.map((emailRaw) => EmailToVerifyModel.fromRaw(emailRaw));
  }

  async getEmails(emails?: string[]): Promise<EmailModel[]> {
    const query: any = {};

    if (emails?.length) {
      query.email = { $in: emails };
    }

    const emailsRaw = await this.emailCollection.find(query);
    return emailsRaw.map((emailRaw) => EmailModel.fromRaw(emailRaw));
  }

  async checkEmailsExists(emails: string[]): Promise<number> {
    return await this.emailCollection.countDocuments({ email: { $in: emails } });
  }
}
