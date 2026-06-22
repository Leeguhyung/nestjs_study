import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserResponse } from './interfaces/auth.interface';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        @InjectRedis() private redis: Redis,
    ) {}

    async register(
        email: string,
        username: string,
        password: string,
    ): Promise<any> {
        const findUser = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (findUser) {
            throw new Error('이미 존재하는 이메일입니다.');
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: email,
                username: username,
                password: hashedPassword,
            },
        });

        return { id: user.id, email: user.email, username: user.username };
    }

    async login(email: string, password: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: email,
            },
        });

        if (!user) {
            throw new UnauthorizedException('존재하지 않는 이메일입니다.');
        }

        const passwordRehash = await bcrypt.compare(password, user.password);

        if (!passwordRehash) {
            throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
        }

        const token = this.jwtService.sign(
            {
                sub: user.id,
                email: user.email,
                username: user.username,
            },
            { expiresIn: '15m' },
        );

        const refreshToken = this.jwtService.sign(
            {
                sub: user.id,
                email: user.email,
                username: user.username,
            },
            { expiresIn: '7d' },
        );
        await this.redis.set(
            `refresh_token:${user.id}`,
            refreshToken,
            'EX',
            60 * 60 * 24 * 7,
        ); // 7일 동안 유효한 리프레시 토큰 저장

        return { access_token: token, refresh_token: refreshToken };
    }

    async me(id: number): Promise<UserResponse> {
        const user = await this.prisma.user.findUnique({
            where: { id: id },
            select: {
                id: true,
                email: true,
                username: true,
            },
        });

        if (!user) {
            throw new NotFoundException('존재하지 않는 유저입니다.');
        } else {
            return user;
        }
    }

    async updateProfile(user: any, username: string): Promise<any> {
        const updateUser = await this.prisma.user.update({
            where: { id: user.id },
            data: { username: username },
            select: {
                id: true,
                email: true,
                username: true,
            },
        });

        return updateUser;
    }

    async refresh(refreshToken: string): Promise<any> {
        const payload = this.jwtService.verify(refreshToken);
        const userId = payload.sub;

        const storedRefreshToken = await this.redis.get(
            `refresh_token:${userId}`,
        );

        if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
            throw new UnauthorizedException(
                '리프레시 토큰이 유효하지 않습니다.',
            );
        }

        const newAccessToken = this.jwtService.sign(
            {
                sub: payload.sub,
                email: payload.email,
                username: payload.username,
            },
            { expiresIn: '15m' },
        );

        return { access_token: newAccessToken };
    }

    logout(userId: number): Promise<any> {
        return this.redis.del(`refresh_token:${userId}`);
    }
}
