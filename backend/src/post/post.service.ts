import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostService  {
    constructor(private prisma: PrismaService){}
    
    async posts():Promise<any>{
        const posts = await this.prisma.post.findMany({include:{
            author:{
                select:{
                    id: true,
                    email: true,
                    username: true
                }
            }
        }})

        return posts
    }


    async postDetail(id:string):Promise<any>{
        
        const post = await this.prisma.post.findUnique({where:{id : parseInt(id)},include:{
            author:{
                select:{
                    id: true,
                    email: true,
                    username: true
                }
            }
        }

    })
 
    
    if(!post){
        throw Error("게시물을 찾을 수 없습니다.")
    }
    else{
        const {authorId, ...rest} = post
        return rest
    }
      
}



    


    async createPost(user:any , title: string, content: string): Promise<any>{
        const post = await this.prisma.post.create({
            data:{
                title,
                content,
                authorId: user.id
            },
            include:{
                author:{
                    select:{
                        id: true,
                        email:true,
                        username:true
                    }
                }
            }
        })

        const {authorId, ...rest} = post
        console.log(rest)
        return rest
    }


    async updatePost(user:any, id:string, title:string, content:string):Promise<any>{
        const post = await this.prisma.post.findUnique({where:{id: parseInt(id)}})
        if(!post){ throw new NotFoundException("찾는 게시물이 없습니다")}
        if(post.authorId !== user.id){throw new UnauthorizedException("권한이 없습니다")}

        const updatePost = await this.prisma.post.update({where:{id:parseInt(id)},data:{title,content}, include:{
            author:{
                select:{
                    id: true,
                    email: true,
                    username: true
                }
            }
        }})
        
        console.log(updatePost)

        const {authorId,...rest} = updatePost

        console.log(rest)
        return rest

    }

    async deletePost(user:any, id:string):Promise<any>{
        const post = await this.prisma.post.findUnique({where:{id:parseInt(id)}})
        if(!post){ throw new NotFoundException("찾는 게시물이 없습니다")}
        if(post.authorId !== user.id){throw new UnauthorizedException("권한이 없습니다")}
        await this.prisma.post.delete({where:{id:parseInt(id)}})

        return {message:"게시물이 삭제되었습니다."}
    }

}

