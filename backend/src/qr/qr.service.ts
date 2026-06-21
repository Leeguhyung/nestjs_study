import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';
@Injectable()
export class QrService {

    async generateQR(data: string): Promise<any> {
        const qrBuffer = await QRCode.toBuffer(data);
        return qrBuffer;
    }

}
