import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostModule } from './post/post.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/author-post-api'),
    ScheduleModule.forRoot(),
    PostModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
