import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export type tagsArray = string[];

export class CreatePostDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDate()
  @IsNotEmpty()
  external_created_at: Date;

  @IsUrl()
  @IsOptional()
  url: string;

  @IsArray()
  @IsOptional()
  tags: tagsArray;
}
