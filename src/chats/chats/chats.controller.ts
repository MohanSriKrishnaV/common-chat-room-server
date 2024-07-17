import { Body, Controller, NotFoundException, Post } from '@nestjs/common';
import { ChatsService } from '../chats.service';

@Controller('chats')
export class ChatsController {
    constructor(private readonly chatRoomService: ChatsService) {

    }
    @Post('create')
    async createChatRoom() {
        const roomId = await this.chatRoomService.generateUniqueRoomId(); // Generate a unique room ID
        const password = this.generateRandomPassword(); // Generate a random password

        // Assuming `createChatRoom` in `chatRoomService` handles room creation
        const createdRoom = await this.chatRoomService.createChatRoom(roomId, password);

        return { message: 'Chat room created successfully', room: createdRoom, password: password };
    }
    private generateRandomPassword(): string {
        const length = 8;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        return password;
    }

    @Post('join')
    async joinChatRoom(@Body() body: { roomId: string, password: string }) {
        const { roomId, password } = body;
        const isValidPassword = await this.chatRoomService.validatePassword(roomId, password);
        if (!isValidPassword) {
            throw new NotFoundException('Invalid room ID or password');
        }
        return { message: 'Successfully joined chat room', roomId };
    }
}
