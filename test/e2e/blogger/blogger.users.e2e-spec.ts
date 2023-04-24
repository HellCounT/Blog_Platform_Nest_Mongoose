import { INestApplication } from '@nestjs/common';
import { setConfigNestApp } from '../../configuration.test';
import request from 'supertest';
import { bloggerUsersPath } from '../../helpers/paths';
import { blogsFactory, usersFactory } from '../../helpers/factory';
import { InputBanUserForBlogDto } from '../../../src/blogger/users/dto/input.ban-user-for-blog.dto';
import { correctUserBanByBlogger } from '../../test-entities/blogger.user.test-entities';
import { authHeader, bearerAccessToken } from '../../helpers/auth';
import { PaginatorType } from '../../../src/application-helpers/paginator.type';
import { OutputBannedUserByBloggerDto } from '../../../src/blogger/users/dto/output.user-banned-by-blogger.dto';

describe('Super Admin Blogs Controller (e2e)', () => {
  jest.setTimeout(10000);
  let nestApp: INestApplication;
  let app: any;

  beforeAll(async () => {
    nestApp = await setConfigNestApp();
    await nestApp.init();
    app = nestApp.getHttpServer();
  });

  afterAll(async () => {
    await nestApp.close();
  });

  beforeEach(async () => {
    await request(app).delete('/testing/all-data');
  });

  describe(`1. GET ${bloggerUsersPath}:`, () => {
    it('1.1. Should return 401 if blogger is not authorized', async () => {
      await request(app)
        .get(bloggerUsersPath + '/blog/5bf142459b72e12b2b1b2cd')
        .expect(401);
    });
    it('1.2. Should ban user for blog and return 204, then return 200 and one banned user', async () => {
      const user = usersFactory.createUser();
      const userId = await usersFactory.insertUser(app, user);
      const tokenPair = await usersFactory.loginAndGetTokenPair(app, user);
      const blogId = await blogsFactory.insertBlog(app, tokenPair.accessToken);
      const banUserForBlogDto: InputBanUserForBlogDto = {
        ...correctUserBanByBlogger,
        blogId: blogId,
      };

      await request(app)
        .put(bloggerUsersPath + '/' + userId + '/ban')
        .set(authHeader, bearerAccessToken(tokenPair.accessToken))
        .send(banUserForBlogDto)
        .expect(204);
      const response = await request(app)
        .get(bloggerUsersPath + '/blog' + '/' + blogId)
        .set(authHeader, bearerAccessToken(tokenPair.accessToken))
        .expect(200);
      expect(response.body).toEqual<
        PaginatorType<OutputBannedUserByBloggerDto>
      >({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [
          {
            id: expect.any(String),
            login: user.login,
            banInfo: {
              isBanned: banUserForBlogDto.isBanned,
              banDate: expect.any(String),
              banReason: banUserForBlogDto.banReason,
            },
          },
        ],
      });
    });
    it('1.3. Should return 404 if id from uri param not found', async () => {
      const user = usersFactory.createUser();
      const incorrectUserId = '5bf142459b72e12b2b1b2cd';
      await usersFactory.insertUser(app, user);
      const tokenPair = await usersFactory.loginAndGetTokenPair(app, user);
      const blogId = await blogsFactory.insertBlog(app, tokenPair.accessToken);
      const banUserForBlogDto: InputBanUserForBlogDto = {
        ...correctUserBanByBlogger,
        blogId: blogId,
      };
      await request(app)
        .put(bloggerUsersPath + '/' + incorrectUserId + '/ban')
        .set(authHeader, bearerAccessToken(tokenPair.accessToken))
        .send(banUserForBlogDto)
        .expect(404);
    });
  });
});
