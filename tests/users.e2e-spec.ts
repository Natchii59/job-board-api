import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as cookieParser from 'cookie-parser'
import * as request from 'supertest'

import { AppModule } from '../src/app.module'

describe('Users (e2e)', () => {
  let app: INestApplication

  let userId: number

  const usersUserMock = {
    id: expect.any(Number),
    firstName: 'Users',
    lastName: 'E2E',
    email: 'users@test.com',
    role: 'USER',
    birthDate: null,
    phone: null,
    companyId: null,
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
    fullName: 'Users E2E'
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleFixture.createNestApplication()

    app.use(cookieParser(process.env.COOKIE_SECRET))

    await app.init()
  })

  describe('/users (POST)', () => {
    it('should create an user', async () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          firstName: 'Users',
          lastName: 'E2E',
          email: 'users@test.com',
          password: 'Testy123!'
        })
        .expect(201)
        .expect(res => {
          expect(res.body).toEqual(usersUserMock)
        })
        .then(res => {
          userId = res.body.id
        })
    })

    it('should throw an error if email is already exists', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          firstName: 'Users',
          lastName: 'E2E',
          email: 'users@test.com',
          password: 'Testy123!'
        })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'Email already exists')
          expect(res.body).toHaveProperty('statusCode', 400)
        })
    })

    it('should throw an error if body is invalid', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          firstName: 'a',
          lastName: 'a',
          email: 'invalid-email',
          password: 'short'
        })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty(
            'message',
            expect.arrayContaining([
              expect.objectContaining({
                path: 'firstName',
                messages: expect.arrayContaining([
                  'firstName must be longer than or equal to 3 characters'
                ])
              }),
              expect.objectContaining({
                path: 'lastName',
                messages: expect.arrayContaining([
                  'lastName must be longer than or equal to 3 characters'
                ])
              }),
              expect.objectContaining({
                path: 'email',
                messages: expect.arrayContaining(['email must be an email'])
              }),
              expect.objectContaining({
                path: 'password',
                messages: expect.arrayContaining([
                  'password is not strong enough',
                  'password must be longer than or equal to 8 characters'
                ])
              })
            ])
          )
        })
    })
  })

  describe('/users/:id (GET)', () => {
    let jwtToken: string

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: 'users@test.com',
          password: 'Testy123!'
        })

      jwtToken = res.body.accessToken
    })

    it('should get an user', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)
        .expect(res => {
          expect(res.body).toEqual(usersUserMock)
        })
    })

    it('should throw an error if user is not found', () => {
      return request(app.getHttpServer())
        .get('/users/9999')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(404)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'User not found')
          expect(res.body).toHaveProperty('statusCode', 404)
        })
    })

    it('should throw an error if user is not authenticated', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'Unauthorized')
          expect(res.body).toHaveProperty('statusCode', 401)
        })
    })

    it('should throw an error if user id is not a number', () => {
      return request(app.getHttpServer())
        .get('/users/abc')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty(
            'message',
            'Validation failed (numeric string is expected)'
          )
          expect(res.body).toHaveProperty('statusCode', 400)
        })
    })
  })

  describe('/users/:id (PUT)', () => {
    let jwtToken: string
    let adminJwtToken: string

    beforeAll(async () => {
      const resUser = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: 'users@test.com',
          password: 'Testy123!'
        })

      jwtToken = resUser.body.accessToken

      const resAdmin = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: 'admin@test.com',
          password: 'Testy123!'
        })

      adminJwtToken = resAdmin.body.accessToken
    })

    afterAll(async () => {
      await request(app.getHttpServer())
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send({
          firstName: 'Users',
          lastName: 'E2E',
          role: 'USER'
        })
    })

    it('should update own user', () => {
      return request(app.getHttpServer())
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          firstName: 'New Users'
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toEqual({
            ...usersUserMock,
            firstName: 'New Users',
            fullName: 'New Users E2E'
          })

          expect(res.headers).toHaveProperty(
            'set-cookie',
            expect.arrayContaining([expect.stringContaining('jwt=')])
          )
        })
    })

    it('should update other user if admin', () => {
      return request(app.getHttpServer())
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send({
          firstName: 'Users'
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toEqual(usersUserMock)

          expect(res.headers).not.toHaveProperty('set-cookie')
        })
    })

    it('should throw an error if user is not found', () => {
      return request(app.getHttpServer())
        .put('/users/9999')
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send({
          firstName: 'New Users'
        })
        .expect(404)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'User not found')
          expect(res.body).toHaveProperty('statusCode', 404)
        })
    })

    it('should throw an error if user is not authenticated', () => {
      return request(app.getHttpServer())
        .put(`/users/${userId}`)
        .send({
          firstName: 'New Users'
        })
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'Unauthorized')
          expect(res.body).toHaveProperty('statusCode', 401)
        })
    })

    it('should throw an error if user is not admin and not own user', () => {
      return request(app.getHttpServer())
        .put(`/users/1`) // Admin user id
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          firstName: 'New Users'
        })
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'Unauthorized')
          expect(res.body).toHaveProperty('statusCode', 401)
        })
    })

    it('should throw an error if user id is not a number', () => {
      return request(app.getHttpServer())
        .put('/users/abc')
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send({
          firstName: 'New Users'
        })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty(
            'message',
            'Validation failed (numeric string is expected)'
          )
          expect(res.body).toHaveProperty('statusCode', 400)
        })
    })

    it('should throw an error if body is invalid', () => {
      return request(app.getHttpServer())
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          firstName: 'a',
          lastName: null
        })
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty(
            'message',
            expect.arrayContaining([
              expect.objectContaining({
                path: 'firstName',
                messages: expect.arrayContaining([
                  'firstName must be longer than or equal to 3 characters'
                ])
              }),
              expect.objectContaining({
                path: 'lastName',
                messages: expect.arrayContaining([
                  'lastName must be longer than or equal to 3 characters'
                ])
              })
            ])
          )
        })
    })

    it('should throw an error if user try to update role', () => {
      return request(app.getHttpServer())
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          role: 'ADMIN'
        })
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'Unauthorized')
          expect(res.body).toHaveProperty('statusCode', 401)
        })
    })

    it('should update role of other user if admin', () => {
      return request(app.getHttpServer())
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .send({
          role: 'ADMIN'
        })
        .expect(200)
        .expect(res => {
          expect(res.body).toEqual({
            ...usersUserMock,
            role: 'ADMIN'
          })
        })
    })
  })

  describe('/users/:id (DELETE)', () => {
    let jwtToken: string
    let adminJwtToken: string

    let otherUserId: number

    beforeAll(async () => {
      const resUser = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: 'users@test.com',
          password: 'Testy123!'
        })

      jwtToken = resUser.body.accessToken

      const resAdmin = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({
          email: 'admin@test.com',
          password: 'Testy123!'
        })

      adminJwtToken = resAdmin.body.accessToken

      const resOtherUser = await request(app.getHttpServer())
        .post('/users')
        .send({
          firstName: 'Other User',
          lastName: 'E2E',
          email: 'other.users@test.com',
          password: 'Testy123!'
        })

      otherUserId = resOtherUser.body.id
    })

    it('should throw an error if user is not found', () => {
      return request(app.getHttpServer())
        .delete('/users/9999')
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .expect(404)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'User not found')
          expect(res.body).toHaveProperty('statusCode', 404)
        })
    })

    it('should throw an error if user is not authenticated', () => {
      return request(app.getHttpServer())
        .delete(`/users/${otherUserId}`)
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'Unauthorized')
          expect(res.body).toHaveProperty('statusCode', 401)
        })
    })

    it('should throw an error if user is not admin and not own user', () => {
      return request(app.getHttpServer())
        .delete(`/users/1`) // Admin user id
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(401)
        .expect(res => {
          expect(res.body).toHaveProperty('message', 'Unauthorized')
          expect(res.body).toHaveProperty('statusCode', 401)
        })
    })

    it('should throw an error if user id is not a number', () => {
      return request(app.getHttpServer())
        .delete('/users/abc')
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .expect(400)
        .expect(res => {
          expect(res.body).toHaveProperty(
            'message',
            'Validation failed (numeric string is expected)'
          )
          expect(res.body).toHaveProperty('statusCode', 400)
        })
    })

    it('should delete own user', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(204)
        .expect(res => {
          expect(res.headers).toHaveProperty(
            'set-cookie',
            expect.arrayContaining([expect.stringContaining('jwt=;')])
          )
        })
    })

    it('should delete other user if admin', () => {
      return request(app.getHttpServer())
        .delete(`/users/${otherUserId}`)
        .set('Authorization', `Bearer ${adminJwtToken}`)
        .expect(204)
        .expect(res => {
          expect(res.headers).not.toHaveProperty('set-cookie')
        })
    })
  })
})
