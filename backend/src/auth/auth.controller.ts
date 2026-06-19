import { Controller } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Controller('auth')
export class AuthController {
    constructor(private prisma: PrismaService) {
 

    
    }

}
