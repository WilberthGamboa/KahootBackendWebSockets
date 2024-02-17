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
      this.question()
    }

  }


  gameStart() {
    return new Promise<void>((resolve, reject) => {
      let remainingSeconds = 10;
  
      const countdown = () => {
        if (remainingSeconds >= 0) {
          this.wss.emit('gamestart', remainingSeconds);
          remainingSeconds--;
          setTimeout(countdown, 1000); // Espera 1 segundo antes de la próxima llamada recursiva
        } else {
          resolve(); // Resuelve la promesa cuando la cuenta regresiva termina
        }
      };
  
      countdown(); // Comienza la cuenta regresiva
    });
  }
  
  async question() {
    for (let index = 0; index < 2; index++) {
      this.indexGlobal= index;
      this.wss.emit('question',this.authService.getQuestion(index))
      await this.gameStart();
       // Espera a que la cuenta regresiva actual termine antes de iniciar la siguiente
      // Realiza otras acciones después de que la cuenta regresiva termine, si es necesario
    }
    this.indexGlobal=0;
  }
  @SubscribeMessage('answer')
  answer(client: Socket, payload: any) {
    
    this.authService.sumatoriaPreguntas(client,payload.name,this.indexGlobal)
    this.wss.emit('clients-updated',this.authService.getConnectedClients())
  }





}
