import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PostModule } from './post/post.module';
import { QrModule } from './qr/qr.module';
import { ChatModule } from './chat/chat.module';
import { RedisModule } from '@nestjs-modules/ioredis';

@Module({
    imports: [
        PrismaModule,
        AuthModule,
        PostModule,
        QrModule,
        ChatModule,
        RedisModule.forRoot({ type: 'single', url: 'redis://localhost:6379' }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
