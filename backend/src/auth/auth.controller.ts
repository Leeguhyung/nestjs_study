import {
    Body,
    Controller,
    Get,
    Patch,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserResponse } from './interfaces/auth.interface';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    register(
        @Body()
        {
            email,
            username,
            password,
        }: {
            email: string;
            username: string;
            password: string;
        },
    ): Promise<any> {
        return this.authService.register(email, username, password);
    }

    @Post('login')
    login(
        @Body() { email, password }: { email: string; password: string },
    ): Promise<any> {
        return this.authService.login(email, password);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@Req() { user }: any): Promise<UserResponse> {
        console.log(user.id);
        return this.authService.me(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    updateProfile(
        @Req() { user }: any,
        @Body() { username }: { username: string },
    ): Promise<any> {
        return this.authService.updateProfile(user, username);
    }
}
