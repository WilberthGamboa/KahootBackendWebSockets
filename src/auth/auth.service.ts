import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
interface ConnectedClients {
    [id: string]: {
     
        name:string
       
    }
}


@Injectable()
export class AuthService {
    private connectedClients: ConnectedClients = {}
    async registerClient(client:Socket){
        this.connectedClients[client.id] = {
        
            name:''
         
        };
    }

    async removeClient( clientId: string ) {
       await delete this.connectedClients[clientId];
    }

    
    getConnectedClients(): any {
   
        return  this.connectedClients ;
    }
    
  

    registerName(client:Socket,paylaod:any){

        const element = this.connectedClients[client.id]
        element.name=paylaod.name;
        this.connectedClients[client.id]= element;
        console.log(this.connectedClients)

    }
}



