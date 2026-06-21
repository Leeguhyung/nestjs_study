import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService){}

    async getMessage(room: string){
        const savedMessages = await this.prisma.chatMessage.findMany({
            where: {
              room: room
            }
          })

        return savedMessages
    }


    async savedMesaage(room: string,message: string, username: string):Promise<any>{
        const savedMessage = await this.prisma.chatMessage.create({
            data: {
                room: room,
                message: message,
                username: username
            }
        })

        return savedMessage
    }

}
