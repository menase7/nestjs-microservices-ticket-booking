import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationLog } from './notification.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5434,
      username: 'postgres',
      password: 'postgrespassword',
      database: 'ticket_booking_db',
      entities: [NotificationLog],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([NotificationLog]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class AppModule {}
