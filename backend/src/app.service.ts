import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '서버가 실행되었습니다!! 우끼끼';
  }
}
