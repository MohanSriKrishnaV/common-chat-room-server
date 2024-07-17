import { Injectable, Logger, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './scehmas/message.schema';
import { ChatRoom, ChatRoomDocument } from './scehmas/room.schema';


@Injectable()
export class ChatsService {
  constructor(@InjectModel(ChatRoom.name) private chatRoomModel: Model<ChatRoomDocument>, @InjectModel(Message.name) private messageModel: Model<MessageDocument>) {

  }
  create(createChatDto: CreateChatDto) {
    return 'This action adds a new chat';
  }

  findAll() {
    return `This action returns all chats`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
  private readonly logger = new Logger(ChatsService.name);


  async saveMessage(messageWithMetadata: any): Promise<any> {
    this.logger.log(messageWithMetadata, "messageWithMetadata");
    const { message, timestamp, username, dpUrl } = messageWithMetadata;
    const newMessage = new this.messageModel({ message, timestamp, username, dpUrl });
    return await newMessage.save();
  }


  async findAllMessages(): Promise<Message[]> {
    try {
      return await this.messageModel.find().exec();
    } catch (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }
  }


  async createChatRoom(roomId: string, password: string): Promise<ChatRoom> {
    const createdRoom = new this.chatRoomModel({ roomId, password });
    return createdRoom.save();
  }

  async findRoomById(roomId: string): Promise<ChatRoom | null> {
    return this.chatRoomModel.findOne({ roomId }).exec();
  }

  async generateUniqueRoomId(): Promise<string> {
    let roomId = uuidv4(); // Generate UUID
    // Check if the roomId is already taken (not shown in this example)
    return roomId;
  }

  async findChatRoomById(roomId: string): Promise<ChatRoom | null> {
    return this.chatRoomModel.findOne({ roomId }).exec();
  }

  async validatePassword(roomId: string, password: string): Promise<boolean> {
    const room = await this.chatRoomModel.findOne({ roomId }).exec();
    return room ? room.password === password : false;
  }
  async findMessagesByRoomId(roomId: string): Promise<Message[]> {
    return this.messageModel.find({ roomId }).exec();
  }
}
