import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsGateway } from './chats.gateway';
import { UtilityController } from './utility/utility.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageSchema } from './scehmas/message.schema';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from './multer/muler.config';

@Module({
  providers: [ChatsGateway, ChatsService],
  controllers: [UtilityController],
  imports: [MulterModule.register(multerConfig), MongooseModule.forRoot('mongodb://127.0.0.1:27017/nest-chat-room'),
  MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),]
})
export class ChatsModule { }
