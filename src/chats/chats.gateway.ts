import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './scehmas/message.schema';

@WebSocketGateway({ cors: true })
export class ChatsGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly chatsService: ChatsService, @InjectModel(Message.name) private messageModel: Model<MessageDocument>) { }

  @SubscribeMessage('createChat')
  create(@MessageBody() createChatDto: CreateChatDto) {
    return this.chatsService.create(createChatDto);
  }

  @SubscribeMessage('findAllChats')
  findAll() {
    return this.chatsService.findAll();
  }

  @SubscribeMessage('findOneChat')
  findOne(@MessageBody() id: number) {
    return this.chatsService.findOne(id);
  }

  @SubscribeMessage('updateChat')
  update(@MessageBody() updateChatDto: UpdateChatDto) {
    return this.chatsService.update(updateChatDto.id, updateChatDto);
  }

  @SubscribeMessage('removeChat')
  remove(@MessageBody() id: number) {
    return this.chatsService.remove(id);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, roomId: string) {
    // console.log(roomId, "roomId", typeof (roomId));

    client.join(roomId); // Join the specified room
    console.log(`Client ${client.id} joined room ${roomId}`);
    client.emit('roomJoined', roomId); // Emit an event 'roomJoined' with the roomId to the client
    // Optionally, you can emit events or perform other actions upon room join
  }

  // @SubscribeMessage('message')
  // handleMessage(client: Socket, message: string) {
  //   console.log(client.rooms, "client");

  //   const roomId = Object.keys(client.rooms)[1]; // Assuming the second room is the chat room
  //   this.server.to(roomId).emit('message', message); // Broadcast message to all clients in the room
  // }
  // @SubscribeMessage('message')
  // handleMessage(client: Socket, message: string) {
  //   console.log(`Received message from ${client.id}: ${message}`);
  //   this.server.emit('message', message); // Broadcast message to all connected clients
  // }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, messageWithMetadata: any) {
    console.log(messageWithMetadata, "messageWithMetadata");

    // const { message, timestamp, username, dpUrl } = messageWithMetadata;
    const { message, timestamp, username, dpUrl, mediaType, mediaUrl } = messageWithMetadata;

    // console.log(`Received message from ${username} (${client.id}): ${message} at ${timestamp}`);
    const messageId = uuidv4(); // Generate a UUID for the message
    const messageWithId = {
      ...messageWithMetadata,
      id: messageId,
      emojis: [] // Initialize emojis array as empty
    };

    this.server.emit('message', { ...messageWithId });

    console.log(messageWithId, "messageWithId");
    try {
      const createdMessage = new this.messageModel(messageWithId);
      console.log(createdMessage, "createdMessage");
      return await createdMessage.save();

      // const createdMessage = new this.messageModel({
      //   message,
      //   timestamp,
      //   username,
      //   dpUrl,
      //   mediaType,
      //   mediaUrl,
      //   id: messageId,
      //   emojis: [] // Initialize emojis array as empty
      // });

      // // Save the message to MongoDB using Mongoose
      // const savedMessage = await createdMessage.save();


    }
    catch (err) {
      console.log(err, "err");
    }
    // console.log(createdMessage, "createdMessage");

    // console.log(savedMessage, "savedMessage");
    // Broadcast message with metadata including dpUrl
  }

  @SubscribeMessage('messageReaction')
  async handleMessageReaction(client: Socket, data: any) {
    console.log(data, "data");
    const { messageId, reaction, username } = data;
    try {
      let message = await this.messageModel.findOne({ id: messageId });
      if (!message) {
        throw new Error('Message not found');
      }

      console.log("message found", message);
      // Check if the user has already reacted with any emoji
      // const existingReaction = message?.emojis?.find(e => e.reactedBy.includes(username));
      // console.log(message.emojis, "message.emojis");\
      // console.log(existingReaction, "existingReaction");
      // Check if the user has already reacted with any emoji
      const existingReaction = message.emojis.find(e => e.type === reaction && e.reactedBy.includes(username));
      // const existingReaction2 = message.emojis.find(e => e.reactedBy.includes(username));
      // console.log(existingReaction, "existingReaction2");

      if (existingReaction) {
        // Increment the count of the existing reaction
        existingReaction.count += 1;
      } else {
        // Create a new emoji reaction if it doesn't exist
        let emoji = { type: reaction, count: 1, reactedBy: [username] };
        message.emojis.push(emoji);
      }

      let result = await message.save();
      // console.log(result, "result");
      console.log(message, "message after wemoji updating");

      // console.log(message, "updated message");
      // Emit updated message with emojis to all clients
      this.server.emit('EmojisUpdated', message);

      return { status: 'success', message: 'Reaction saved' };
    } catch (error) {
      console.error("Failed to save reaction", error);

      return { status: 'error', message: 'Failed to save reaction' };
    }
  }


  @SubscribeMessage('getAllMsgs')
  async GetAllMsgs(client: Socket, data: any) {
    try {
      const messages = await this.chatsService.findAllMessages();
      // client.emit('gettingAllMsgs', messages); // Emit allMessages event back to the client with fetched messages
      this.server.emit('gettingAllMsgs', messages);

    } catch (error) {
      console.error('Error fetching messages:', error.message);
    }
  }









  @SubscribeMessage('disconnecting')
  handleDisconnecting(client: Socket, username: string) {
    // Handle logic when a client is disconnecting (e.g., leaving chat room)
    // console.log(`Client ${client.id} (${username}) is disconnecting`);

    // Perform cleanup or notification tasks, such as removing the user from the chat room
    // Example: Notify other clients about the user leaving
    client.broadcast.emit('userLeft', username);
  }

  private activeTypers: Set<string> = new Set();


  @SubscribeMessage('typing')
  handleTypingEvent(client: Socket, username: string) {
    this.activeTypers.add(username); // Add username to active typers
    this.broadcastTypingUsers();
  }

  @SubscribeMessage('stopTyping')
  handleStopTypingEvent(client: Socket, username: string) {
    this.activeTypers.delete(username); // Remove username from active typers
    this.broadcastTypingUsers();
  }

  private broadcastTypingUsers() {
    this.server.emit('typing', Array.from(this.activeTypers)); // Broadcast active typers to all clients
  }
  handleDisconnect(client: Socket) {
    // console.log(`Client disconnected: ${client.id}`);
    // Remove client from active typers if they disconnect
    this.activeTypers.forEach(username => {
      if (client.id === username) {
        this.activeTypers.delete(username);
      }
    });
    this.broadcastTypingUsers();
  }


  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(@MessageBody() messageId: string) {
    try {
      const deletedMessage = await this.messageModel.findOneAndDelete({ id: messageId }).exec();

      if (!deletedMessage) {
        throw new Error('Message not found');
      }

      // Broadcast deletion event to all connected clients
      this.server.emit('messageDeleted', messageId);

      return { status: 'success', message: 'Message deleted successfully' };
    } catch (error) {
      console.error('Failed to delete message:', error);
      return { status: 'error', message: 'Failed to delete message' };
    }
  }


  @SubscribeMessage('editMessage')
  async handleEditMessage(@MessageBody() editedMessage: any) {
    const { id, newMessage } = editedMessage;

    try {
      const updatedMessage = await this.messageModel.findOneAndUpdate(
        { id: id },
        { message: newMessage },
        { new: true }
      );

      if (!updatedMessage) {
        throw new Error('Message not found');
      }

      this.server.emit('messageEdited', updatedMessage);

      return { status: 'success', message: 'Message edited successfully' };
    } catch (error) {
      console.error('Failed to edit message:', error);
      return { status: 'error', message: 'Failed to edit message' };
    }
  }


}
