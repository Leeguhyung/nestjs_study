import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import { ChatService } from './chat.service';


@WebSocketGateway({cors: true})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server
  constructor(private jwtService: JwtService, private ChatService : ChatService) {}


  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    
    try {
     const payload = await this.jwtService.verify(token);
     client.data.username = payload.username;
    } catch (error) {
      client.disconnect();
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client:Socket,payload:{ room: string}){
    client.join(payload.room);
    const savedMessages = await this.ChatService.getMessage(payload.room)
    client.emit('roomMessages', savedMessages);
  }


  @SubscribeMessage('sendMessage')
  async handleMessage(client: Socket, payload: {room:string, message: string}){
    const savedMessage = await this.ChatService.savedMesaage(payload.room, payload.message, client.data.username)
    this.server.to(payload.room).emit('message', savedMessage)
  }





}
