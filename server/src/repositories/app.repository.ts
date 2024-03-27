import { Inject, Injectable } from '@nestjs/common';
import { Db, ObjectId, ReturnDocument } from 'mongodb';
import { EmailModel, EmailToVerifyModel } from "./model/Emails.model";

@Injectable()
export class AppRepository {
  constructor(@Inject('DB_CONNECTION') private readonly db: Db) {}

  async saveEmails(emails: string[]): Promise<void> {
    const emailsToInsert = emails.map((email) => {
      return { email, status: 'validating', createdAt: new Date() };
    });

    await this.db.collection('emails').insertMany(emailsToInsert);
  }

  async updateEmailStatus(
    emailId: string,
    status: string,
  ): Promise<EmailModel> {
    const query = { _id: new ObjectId(emailId) };
    const propsToUpdate = { $set: { status } };
    const options = {
      returnDocument: ReturnDocument.AFTER,
      projection: { _id: 1, email: 1, status: 1 },
    };
    const updatedEmail = await this.db.collection('emails').findOneAndUpdate(query, propsToUpdate, options);

    return EmailModel.fromRaw(updatedEmail);
  }

  async getNextEmailsToVerify(size: number): Promise<EmailToVerifyModel[]> {
    const query = { status: 'validating' };
    const options = { limit: size, projection: { _id: 1, email: 1 } };
    const emails = await this.db.collection('emails').find(query, options).toArray();

    return emails.map((emailRaw) => EmailToVerifyModel.fromRaw(emailRaw));
  }

  async getEmails(emails?: string[]): Promise<EmailModel[]> {
    const query = {};

    if (emails?.length) {
      query['email'] = { $in: emails };
    }

    const options = { projection: { _id: 1, email: 1, status: 1 } };
    const emailsRaw = await this.db.collection('emails').find(query, options).toArray();

    return emailsRaw.map((emailRaw) => EmailModel.fromRaw(emailRaw));
  }

  async checkEmailsExists(emails: string[]): Promise<number> {
    return await this.db.collection('emails').countDocuments({ email: { $in: emails } });
  }
}
