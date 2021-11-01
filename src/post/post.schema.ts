import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, index: true, required: true })
  id: string;

  @Prop({ type: String })
  author: string;

  @Prop({ type: String })
  title: string;

  @Prop({ type: Boolean })
  id_deleted: boolean;

  @Prop({ type: Date })
  external_created_at: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
