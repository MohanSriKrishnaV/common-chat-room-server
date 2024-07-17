import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatsModule } from './chats/chats.module';
import { ChatsService } from './chats/chats.service';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';


@Module({
  imports: [ChatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {

  }

}
