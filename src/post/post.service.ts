import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
  created_at: string;
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
  private async handleCronGetExternalPosts(): Promise<void> {
    try {
      this.httpService
        .get('https://hn.algolia.com/api/v1/search_by_date?query=nodejs')
        .subscribe(async (res: AxiosResponse) => {
          try {
            // console.log(res.data);
            const externalPost = res.data.hits.map<CreatePostDto>(
              (data: ExternalPostDate) => ({
                id: data.objectID,
                author: data.author,
                title: data.title,
                tags: data._tags,
                url: data.story_url,
                external_created_at: new Date(data.created_at),
                is_deleted: false,
              }),
            );
            const existingPost = await this.getPostsCount();
            if (existingPost === 0) {
              await this.createPosts(externalPost);
              // console.log(postsSnapshot);
            }
            const nonExistingPost = await this.getPostForExternalId(
              externalPost.map((e) => e.id),
            );
            const matchPosts = nonExistingPost.map<CreatePostDto>((p) => {
              const postDto = externalPost.find((pdto) => p.id === pdto.id);
              if (postDto) {
                return postDto;
              }
            });

            // const postNotExisting = externalPost.filter((o1) =>
            //   existingPost.some((o2) => o1.id !== o2.id),
            // );

            console.log('externalPost', externalPost);
            console.log('nonExistingPost', nonExistingPost);
            console.log('matchPosts', matchPosts);
            if (nonExistingPost.length > 0) {
              const postsSnapshot = await this.createPosts(matchPosts);
              console.log(postsSnapshot);
            }
          } catch (err) {
            throw err;
          }
        });

      this.logger.debug('Called when the current second is 45');
    } catch (err) {
      this.logger.error(
        'An error occurred while getting post from external path',
      );
    }
  }

  getAllPost(): Promise<PostDocument[]> {
    try {
      return this.postModel.find({ is_deleted: false }).exec();
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  private getPostsCount(): Promise<number> {
    return this.postModel.find().count().exec();
  }

  private getPostForExternalId(ids: string[]) {
    return this.postModel.find({ id: { $nin: [...ids] }, id_deleted: false });
  }

  private createPosts(
    createPostsDto: CreatePostDto[],
  ): Promise<PostDocument[]> {
    try {
      return this.postModel.insertMany(createPostsDto);
    } catch (err) {
      this.logger.error('An error occurred while saving the posts');
      throw new InternalServerErrorException();
    }
  }

  async getOnePost(id: string): Promise<PostDocument> {
    let post: PostDocument;
    try {
      post = await this.postModel.findOne({ id, is_deleted: false }).exec();
    } catch (err) {
      throw new InternalServerErrorException();
    }
    if (!post) {
      throw new NotFoundException('Post Not Found');
    }
    return post;
  }

  async deletePost(id: string): Promise<PostDocument> {
    const post = await this.getOnePost(id);
    try {
      await this.postModel
        .updateOne({ id }, { is_deleted: true }, { returnOriginal: false })
        .exec();
      return post;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
}
