import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
@Module({
  imports: [PrismaModule, JwtModule.register({
    secret: 'your-secret-key',
    signOptions: { expiresIn: '1h' },
  })],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}
