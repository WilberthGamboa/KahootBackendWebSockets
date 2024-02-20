import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from "socket.io";
import { AuthService } from './auth.service';

@WebSocketGateway({ cors: true })
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private indexGlobal = 0;
  constructor(private readonly authService: AuthService) { }
  /*
@WebSocketServer() wss:Server // permite enviar al front
@SubscribeMessage('message') nos permite escuchar mensajes de front 
  */

  @WebSocketServer() wss: Server
  // Manejo de los clientes que se conectan
  async handleConnection(client: Socket) {
    // Handle connection event
    await this.authService.registerClient(client,this.wss);


  }

  // Manejo de los clientes que se desconectan
  async handleDisconnect(client: Socket) {
    // Handle disconnection event
    await this.authService.removeClient(client.id,this.wss);
    
  }
  // Envio de nombres al cliente
  @SubscribeMessage('message')
  registerName(client: Socket, payload: any) {
    this.authService.registerName(client, payload,this.wss);
  
  }

  @SubscribeMessage('answer')
  answer(client: Socket, payload: any) {
    this.authService.sumatoriaPreguntas(client,payload.name,this.indexGlobal,this.wss)
    
  }





}
