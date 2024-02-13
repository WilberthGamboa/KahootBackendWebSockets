import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
interface ConnectedClients {
    [id: string]: {
     
        name:string
       
    }
}
interface Question {
    pregunta:string;
    respuesta:string[],
    respuestaCorrecta:number
}

@Injectable()
export class AuthService {
    private connectedClients: ConnectedClients = {}
    private questions:Question[] = [
        {
            pregunta:'¿Cuanto es 2+2?',
            respuesta:[
                '1',
                '2',
                '3',
                '4'
            ],
            respuestaCorrecta:1
        },
        {
            pregunta:'¿Cuanto es 2+3?',
            respuesta:[
                '1',
                '5',
                '3',
                '4'
            ],
            respuestaCorrecta:1
        }
    ]
 
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

    validateGameStart() {
        return Object.values(this.connectedClients).every(client => client.name !== '');
    }

    getQuestion(index:number){
        this.questions[index];
    }
    
}



