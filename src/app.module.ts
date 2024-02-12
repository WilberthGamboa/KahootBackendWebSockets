import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGateway } from './auth/auth.gateway';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, AuthGateway, AuthService],
})
export class AppModule {}
