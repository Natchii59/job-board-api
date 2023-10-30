import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as cookieParser from 'cookie-parser'
import * as request from 'supertest'

import { AppModule } from '../src/app.module'

describe('Authentification (e2e)', () => {
  let app: INestApplication

  const authUserMock = {
    id: expect.any(Number),
    firstName: 'Auth',
    lastName: 'E2E',
    email: 'auth@test.com',
    role: 'USER',
    birthDate: null,
    phone: null,
    companyId: null,
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
    fullName: 'Auth E2E'
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()

    app.use(cookieParser(process.env.COOKIE_SECRET))

    await app.init()
  })

  describe('/auth/sign-in (POST)', () => {
    it('should sign in a user', () => {
      return request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: 'auth@test.com',
          password: 'Testy123!'
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toHaveProperty('accessToken', expect.any(String))
          expect(res.headers['set-cookie']).toEqual(
            expect.arrayContaining([expect.stringContaining('jwt=')])
          )
        })
    })

    it('should not sign in a user with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: 'invalid-email',
          password: 'Testy123!'
        })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty(
            'message',
            expect.arrayContaining([
              expect.objectContaining({
                path: 'email',
                messages: expect.arrayContaining(['email must be an email'])
              })
            ])
          )
        })
    })

    it('should not sign in a user with not existing email', () => {
      return request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: 'not@email.com',
          password: 'Testy123!'
        })
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'Unauthorized')
          expect(res.body).toHaveProperty('statusCode', 401)
        })
    })

    it('should not sign in a user with wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: 'auth@test.com',
          password: 'wrong-password'
        })
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'Unauthorized')
          expect(res.body).toHaveProperty('statusCode', 401)
        })
    })
  })

  describe('/auth/profile (GET)', () => {
    let jwtCookie: string
    let jwtToken: string

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: 'auth@test.com',
          password: 'Testy123!'
        })

      jwtCookie = res.headers['set-cookie'][0]
      jwtToken = res.body.accessToken
    })

    it('should get the current user profile with cookie', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Cookie', jwtCookie)
        .expect(200)
        .expect(res => {
          expect(res.body).toEqual(authUserMock)
        })
    })

    it('should get the current user profile with authorization header', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toEqual(authUserMock)
        })
    })

    it('should not get the current user profile if not authenticated', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'Unauthorized')
          expect(res.body).toHaveProperty('statusCode', 401)
        })
    })
  })

  describe('/auth/sign-out (POST)', () => {
    let jwtCookie: string

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: 'auth@test.com',
          password: 'Testy123!'
        })

      jwtCookie = res.headers['set-cookie'][0]
    })

    it('should sign out a user', () => {
      return request(app.getHttpServer())
        .post('/auth/sign-out')
        .set('Cookie', jwtCookie)
        .expect(204)
        .expect(res => {
          expect(res.headers['set-cookie']).toEqual(
            expect.arrayContaining([expect.stringContaining('jwt=;')])
          )
        })
    })

    it('should not sign out a user if not authenticated', () => {
      return request(app.getHttpServer())
        .post('/auth/sign-out')
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'Unauthorized')
          expect(res.body).toHaveProperty('statusCode', 401)
        })
    })
  })
})
