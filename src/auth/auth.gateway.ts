import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from "socket.io";
import { AuthService } from './auth.service';

@WebSocketGateway({ cors: true })
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {

  constructor(private readonly authService: AuthService) { }
  /*
@WebSocketServer() wss:Server // permite enviar al front
@SubscribeMessage('message') nos permite escuchar mensajes de front 
  */
  @WebSocketServer() wss: Server


  async handleConnection(client: Socket) {
    // Handle connection event
    await this.authService.registerClient(client);
    this.wss.emit('clients-updated', this.authService.getConnectedClients());

  }

  async handleDisconnect(client: Socket) {
    // Handle disconnection event
    await this.authService.removeClient(client.id);
    this.wss.emit('clients-updated', this.authService.getConnectedClients());
  }



  @SubscribeMessage('message')
  registerName(client: Socket, payload: any) {
    this.authService.registerName(client, payload)
    this.wss.emit('clients-updated', this.authService.getConnectedClients());

    if (this.authService.validateGameStart()) {
      this.gameStart()
    }

  }


  gameStart() {  
    let remainingSeconds = 10;

    const countdownInterval = setInterval(() => {
      this.wss.emit('gamestart', remainingSeconds);
      remainingSeconds--;

      if (remainingSeconds < 0) {
        clearInterval(countdownInterval);
     
      }
    }, 1000);
    
   

  


  }



}
