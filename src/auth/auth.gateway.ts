import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket } from 'dgram';
import { Server } from 'http';

@WebSocketGateway({cors:true})
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  handleConnection(client:any) {
    // Handle connection event
    console.log('hola pete'+ client.id)
  }

  handleDisconnect(client: any) {
    // Handle disconnection event
  }
}
