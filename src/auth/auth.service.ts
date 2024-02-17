import { BadGatewayException, Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
interface ConnectedClients {
    [id: string]: {
     
        name:string
        totalDeRespuestasCorrectas:number
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
    private gameStart = false;
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
        if (this.gameStart) {
            throw new BadGatewayException('El juego ha comenzado')
        }else{
            this.connectedClients[client.id] = {
        
                name:'',
                totalDeRespuestasCorrectas:0
             
            };
        }
       
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
        if (!this.gameStart && Object.values(this.connectedClients).every(client => client.name !== '')) {
            this.gameStart = true;
            return true;
        }
        return false;
    }

    getQuestion(index:number){
        return this.questions[index];
    }

    sumatoriaPreguntas(client:Socket,valor:any,index:number){
        //Verificar si la respuesta es correcta
       
        const respuesta = this.questions[index].respuesta[this.questions[index].respuestaCorrecta]
        console.log({respuesta})
        console.log({valor})
        if (Number(respuesta)===Number(valor)) {
            this.connectedClients[client.id].totalDeRespuestasCorrectas =  this.connectedClients[client.id].totalDeRespuestasCorrectas+1;
        }
        return this.connectedClients;

    }
    
}



