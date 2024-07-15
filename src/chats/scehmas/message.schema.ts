// message.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator

export type MessageDocument = Message & Document;



@Schema({ collection: 'common-chat-room' })
export class Message {
    // @Prop({ required: true })
    // message: string;
    // @Prop({ required: true, default: '' })
    // message: string;
    @Prop()
    message: string;

    @Prop({ required: true })
    timestamp: string;

    @Prop({ required: true })
    username: string;

    @Prop()
    dpUrl?: string;

    @Prop({
        type: [{
            type: { type: String },
            count: { type: Number },
            reactedBy: [{ type: String }] // Array of usernames who reacted with this emoji

        }]
    })
    emojis: { type: string; count: number; reactedBy: string[] }[];

    @Prop()
    mediaType?: string; // Add media type field

    @Prop()
    mediaUrl?: string; // Add media URL field

    @Prop({ default: uuidv4 }) // Default value using UUID generator
    id: string; // Add id field with UUID
}

export const MessageSchema = SchemaFactory.createForClass(Message);
