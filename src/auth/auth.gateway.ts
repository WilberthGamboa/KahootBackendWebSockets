import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket,Server} from "socket.io";
import { AuthService } from './auth.service';


@WebSocketGateway({cors:true})
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(private readonly authService: AuthService){

    }

    @WebSocketServer() wss:Server
 
    @SubscribeMessage('message')
     registerName(client:Socket,payload:any){
       this.authService.registerName(client,payload)
       this.wss.emit('clients-updated', this.authService.getConnectedClients() );
      
    }
  async handleConnection(client:Socket) {
    // Handle connection event

    console.log('hola pete'+ client.id)
    await this.authService.registerClient( client );
    this.wss.emit('clients-updated', this.authService.getConnectedClients() );

  }

  async handleDisconnect(client: Socket) {
    // Handle disconnection event
    console.log('adios pete'+ client.id)
    await this.authService.removeClient( client.id );
    this.wss.emit('clients-updated', this.authService.getConnectedClients() );
  }

  
}
