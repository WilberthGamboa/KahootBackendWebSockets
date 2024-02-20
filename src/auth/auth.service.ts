import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { Socket,Server } from 'socket.io';
import * as fs from 'fs';
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
 
    private globalTime = 10;
    private indexGlobal = 0;
    private file = null;
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
    // Registrar clientes que se van conectando 
    async registerClient(client:Socket,wss:Server){
            this.validateIfGameStart(client);
            this.connectedClients[client.id] = {
                name:'',
                totalDeRespuestasCorrectas:0
            }; 
            wss.emit('clients-updated', this.getConnectedClients());
    }
    // Eliminar clientes que se desconectan
    async removeClient( clientId: string,wss:Server ) {
        delete this.connectedClients[clientId];
        wss.emit('clients-updated', this.getConnectedClients());
    }

    registerName(client:Socket,paylaod:any,wss:Server){
        this.validateIfGameStart(client);
        // Se registra el nombre
        const element = this.connectedClients[client.id]
        element.name=paylaod.name;
        this.connectedClients[client.id]= element;
        // se devuelve el nombre
        wss.emit('clients-updated', this.getConnectedClients());

        // De aquí mismo se va a iniciar el juego, se valida que todos manden su mensaje
        if (this.validateGameStart()) {
            this.question(wss);
          }else{
            this.validateIfGameStart(client)
          }
      
    }
    


    getQuestion(index:number){
        const data = fs.readFileSync('./db.json', 'utf-8');
        const questions = JSON.parse(data);
        console.log({questions})
        const x = questions.privateQuestions
       
         this.file = x;
        return questions.privateQuestions[index];
    }

    sumatoriaPreguntas(client:Socket,valor:string,index:number,wss:Server){
        
        //Verificar si la respuesta es correcta
       valor = valor.trim()
        const respuesta = this.file[this.indexGlobal].respuesta[this.file[this.indexGlobal].respuestaCorrecta]
        console.log({respuesta})
        console.log({valor})
        if (respuesta===valor) {
            const puntos = this.globalTime*100
            this.connectedClients[client.id].totalDeRespuestasCorrectas =  this.connectedClients[client.id].totalDeRespuestasCorrectas+puntos;
        }
        wss.emit('clients-updated',this.getConnectedClients())

    }
    

    validateIfGameStart(client:Socket){
        try {
           
            if (this.gameStart) {
                client._onclose('forced close','namas')
                
            }
        } catch (error) {
            client.emit('registerClientError', { message: error.message });
        }
    }


    // metodos que son exclusivos del service
    getConnectedClients(): any {
   
        return  this.connectedClients;
    }

    validateGameStart(){
        if (!this.gameStart && Object.values(this.connectedClients).every(client => client.name !== '')) {
            this.gameStart = true;
            return true;
        }
        this.gameStart=false;
        return false;
    }

    async question(wss:Server) {
        
        this.gameStart=true;
        for (let index = 0; index < 5; index++) {
          this.indexGlobal= index;
          wss.emit('question',this.getQuestion(index))
          await this.isgameStart(wss);
           // Espera a que la cuenta regresiva actual termine antes de iniciar la siguiente
          // Realiza otras acciones después de que la cuenta regresiva termine, si es necesario
        }
        this.indexGlobal=0;
        this.gameStart=false;
        this.connectedClients = {}
      }
    
      
  isgameStart(wss:Server) {
    return new Promise<void>((resolve, reject) => {
      let remainingSeconds = 10;
      this.globalTime=remainingSeconds;
        
      const countdown = () => {
        if (remainingSeconds >= 0) {
          wss.emit('gamestart', remainingSeconds);
          remainingSeconds--;
          this.globalTime=remainingSeconds;
          setTimeout(countdown, 1000); // Espera 1 segundo antes de la próxima llamada recursiva
        } else {
          resolve(); // Resuelve la promesa cuando la cuenta regresiva termina
        }
      };
  
      countdown(); // Comienza la cuenta regresiva
    });
  }

}   



