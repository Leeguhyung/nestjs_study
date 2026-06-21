import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { QrService } from './qr.service';

@Controller('qr')
export class QrController {
    constructor(private qrService: QrService) {}



    @Get('generate')
    async generateQR(@Query('data') data:string, @Res() res:Response){
        const qrBuffer = await this.qrService.generateQR(data);
        res.setHeader('content-Type', 'image/png');
        res.send(qrBuffer);
    }

}
