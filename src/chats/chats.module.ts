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
  imports: [MulterModule.register(multerConfig), MongooseModule.forRoot('mongodb+srv://icss4502024:k1HEVxdxG8ravXmg@cluster0.cshahqt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
    // , {
    //   useNewUrlParser: true, useUnifiedTopology": true

    // }
  ),
  MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),]
})
export class ChatsModule { }
