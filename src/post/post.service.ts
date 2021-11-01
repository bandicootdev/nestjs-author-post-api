import { Injectable, Logger } from '@nestjs/common';
import { CreatePostDto } from './dtos/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from './post.schema';
import { Model } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { HttpService } from '@nestjs/axios';

interface AxiosResponse {
  data: {
    hits: ExternalPostDate[];
  };
}

interface ExternalPostDate {
  author: string;
  title: string;
  objectID: string;
  _tags: string[];
  story_url: string;
  created_at_i: number;
}

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private httpService: HttpService,
  ) {}

  @Cron('45 * * * * *')
  async handleCronGetExternalPosts(): Promise<void> {
    try {
      new Promise((resolve, reject) => {
        this.httpService
          .get('https://hn.algolia.com/api/v1/search_by_date?query=nodejs')
          .subscribe(async (res: AxiosResponse) => {
            try {
              const posts = res.data.hits.map<CreatePostDto>(
                (data: ExternalPostDate) => ({
                  id: data.objectID,
                  author: data.author,
                  title: data.title,
                  tags: data._tags,
                  url: data.story_url,
                  external_created_at: new Date(data.created_at_i),
                }),
              );
              const postsSnapshot = await this.createPost(posts);
              console.log(postsSnapshot);
              resolve('resolve');
              console.log(res.data);
            } catch (err) {
              reject(err);
            }
          });
      });
      this.logger.debug('Called when the current second is 45');
    } catch (err) {
      this.logger.error('');
    }
  }

  createPost(createPostsDto: CreatePostDto[]) {
    return this.postModel.insertMany(createPostsDto);
    // const postSnapshot = new this.postModel(createPostDto);
    // return postSnapshot.save();
  }
}
