import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuthService } from './auth.service';
import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // this create a repository for us
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    {
      provide: APP_INTERCEPTOR, // We can use in the whole module this interceptor
      useClass: CurrentUserInterceptor,
    },
  ],
})
export class UsersModule {}
