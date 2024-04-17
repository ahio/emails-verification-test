import { Column, Entity, Index, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity({ name: 'emails' })
export class EmailEntity {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ name: 'email', type: 'text' })
  @Index('email_idx')
  email: string;

  @Column({ name: 'status', type: 'enum', enum: ['validating', 'valid', 'invalid'] })
  status: string;

  @Column({ name: 'createdAt', type: 'date' })
  createdAt: Date;

  @Column({ name: 'createdAt', type: 'date' })
  updatedAt: Date;
}