import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../app.module';
import { ValidationPipe } from '@nestjs/common';

describe('Courses API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.DB_PATH = './db/maplewood_school_test.sqlite';
    // Create a testing module and initialize the Nest application
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // Create the Nest application instance
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: false,
      }),
    );
    await app.init(); // Start the application
  });
  afterAll(async () => {
    await app.close();
  });

  it('GET /api/courses returns 200', async () => {
    const response = await request(app.getHttpServer()).get('/api/courses');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
  it('GET /api/courses?grade=8 returns 400', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/courses?grade=8')
      .expect(400);

    const body = res.body as { message: string };

    expect(body.message).toEqual(
      expect.arrayContaining([expect.stringContaining('grade')]),
    );
  });

  it('GET /api/courses?semester=3 returns 400', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/courses?semester=3')
      .expect(400);

    const body = res.body as { message: string };

    expect(body.message).toEqual(
      expect.arrayContaining([expect.stringContaining('semester')]),
    );
  });

  it('GET /api/courses?grade=10&semester=1 returns an array', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/courses?grade=10&semester=1')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });
});
