import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';


@Module({
  imports: [PrismaModule, JwtModule.register({
    secret: 'your-secret-key',
    signOptions: { expiresIn: '1h' },
  }),PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController]
})
export class AuthModule {}
