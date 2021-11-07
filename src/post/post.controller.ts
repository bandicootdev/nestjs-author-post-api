import { Controller, Delete, Get, Param } from '@nestjs/common';
import { PostService } from './post.service';
import { Serialize } from '../interceptors/serialize.interceptor';
import { PostDto } from './dtos/post.dto';

@Controller('post')
@Serialize(PostDto)
export class PostController {
  constructor(private postService: PostService) {}

  @Get()
  getAllPost() {
    return this.postService.getAllPost();
  }

  @Get('/:id')
  getOnePost(@Param('id') id: string) {
    return this.postService.getOnePost(id);
  }

  @Delete('/:id')
  deletePost(@Param('id') id: string) {
    return this.postService.deletePost(id);
  }
}
