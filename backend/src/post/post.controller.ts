import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('posts')
export class PostController {
    constructor(private post: PostService) {}

    @Get()
    async posts(@Query('keyword') keyword: string): Promise<any> {
        return this.post.posts(keyword);
    }

    @Get(':id')
    async postDetail(@Param('id') id: string): Promise<any> {
        return this.post.postDetail(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async createPost(
        @Req() { user }: { user: any },
        @Body() { title, content }: { title: string; content: string },
    ): Promise<any> {
        return this.post.createPost(user, title, content);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async updatePost(
        @Req() { user }: { user: any },
        @Param('id') id: string,
        @Body() { title, content }: { title: string; content: string },
    ): Promise<any> {
        return this.post.updatePost(user, id, title, content);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deletePost(
        @Req() { user }: { user: any },
        @Param('id') id: string,
    ): Promise<any> {
        return this.post.deletePost(user, id);
    }
}
