import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bookingId: string;

  @Column()
  userId: string;

  @Column()
  eventName: string;

  @Column({ default: 'EMAIL' })
  channel: string;

  @Column({ default: 'SENT' })
  status: string;

  @Column('text')
  messageContent: string;

  @CreateDateColumn()
  createdAt: Date;
}
