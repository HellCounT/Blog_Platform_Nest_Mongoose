import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentsQuery } from './comments.query';
import { InputCommentDto } from './dto/input-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/get-decorators/current-user-id.param.decorator';
import { CommentsService } from './comments.service';
import { InputLikeStatusDto } from '../likes/dto/input.like-status.dto';
import { RefreshJwtGuard } from '../auth/guards/refresh-jwt.guard';
import { GetRefreshTokenPayload } from '../auth/decorators/get-decorators/get-refresh-token-payload.decorator';
import { TokenPayloadType } from '../auth/auth.types';

@Controller('comments')
export class CommentsController {
  constructor(
    protected readonly commentsQueryRepo: CommentsQuery,
    protected commentsService: CommentsService,
  ) {}
  @UseGuards(RefreshJwtGuard)
  @Get(':id')
  @HttpCode(200)
  async getCommentById(
    @Param('id') id: string,
    @GetRefreshTokenPayload() payload: TokenPayloadType,
  ) {
    return await this.commentsQueryRepo.findCommentById(
      id,
      payload.userId.toString(),
    );
  }
  @UseGuards(JwtAuthGuard)
  @Put(':commentId ')
  @HttpCode(204)
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: InputCommentDto,
    @Req() req,
  ) {
    return this.commentsService.updateComment(
      commentId,
      req.user.userId,
      updateCommentDto.content,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  @HttpCode(204)
  async deleteComment(
    @Param('commentId') commentId: string,
    @CurrentUser() userId: string,
  ) {
    return await this.commentsService.deleteComment(commentId, userId);
  }
  @UseGuards(JwtAuthGuard)
  @Put(':commentId/like-status')
  @HttpCode(204)
  async updateLikeStatus(
    @Param('commentId') commentId: string,
    @Req() req,
    @Body() likeStatusDto: InputLikeStatusDto,
  ) {
    return await this.commentsService.updateLikeStatus(
      commentId,
      req.user.userId,
      likeStatusDto.likeStatus,
    );
  }
}
