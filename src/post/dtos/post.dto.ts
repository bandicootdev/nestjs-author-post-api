import { Exclude, Expose } from 'class-transformer';
import { tagsArray } from './create-post.dto';
import { ObjectId } from 'mongoose';

export class PostDto {
  @Exclude()
  _id: ObjectId;

  @Exclude()
  __v: number;

  @Expose()
  id: string;

  @Expose()
  author: string;

  @Expose()
  title: string;

  @Expose()
  external_created_at: Date;

  @Expose()
  url: string;

  @Expose()
  tags: tagsArray;
}
