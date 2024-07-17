// chat-room.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatRoomDocument = ChatRoom & Document;

@Schema({ collection: 'roomIds' })
export class ChatRoom {
    @Prop({ unique: true })
    roomId: string;

    @Prop()
    password: string;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
