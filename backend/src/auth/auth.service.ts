import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserResponse } from './interfaces/auth.interface';
@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwtService: JwtService) {}
    
    async register(email: string, username: string, password: string): Promise<any> {
        
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

        const passwordRehash = await bcrypt.compare(password, user.password)

        if (!passwordRehash) {
            throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
        }

        const token = this.jwtService.sign({ sub: user.id, email: user.email, username: user.username })

        return { access_token: token };

    }


    async me(id:number):Promise<UserResponse>{
        const user =await this.prisma.user.findUnique({
            where:{id:id},
            select:{
                id: true,
                email: true,
                username: true
            }
        })

        if(!user){
            throw new NotFoundException('존재하지 않는 유저입니다.')
        }else{
            return user
        }
    }

}
   


