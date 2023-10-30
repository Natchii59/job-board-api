import { Test, TestingModule } from '@nestjs/testing'
import { plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { Response } from 'express'

import { AuthService } from '@/auth/auth.service'
import { authServiceMock } from '@/auth/tests/mocks/auth.service.mock'
import { JWT_COOKIE_NAME, Service } from '@/lib/constants'
import { CreateUserDto } from '../dto/users.dto'
import { UserEntity } from '../entities/user.entity'
import { UsersController } from '../users.controller'
import { UsersService } from '../users.service'
import { userMock } from './mocks/user.mock'
import { usersServiceMock } from './mocks/users.service.mock'

describe('UsersController', () => {
  let controller: UsersController

  let usersService: UsersService
  let authService: AuthService

  const responseMock = {
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis()
  } as unknown as Response

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: Service.USERS,
          useValue: usersServiceMock
        },
        {
          provide: Service.AUTH,
          useValue: authServiceMock
        }
      ]
    }).compile()

    controller = module.get<UsersController>(UsersController)
    usersService = module.get<UsersService>(Service.USERS)
    authService = module.get<AuthService>(Service.AUTH)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
    expect(usersService).toBeDefined()
    expect(authService).toBeDefined()
  })

  describe('Create user', () => {
    it('should create a user', async () => {
      const input: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        password: 'Testy123!'
      }

      const result = await controller.create(input)

      expect(result).toBeInstanceOf(UserEntity)
      expect(result).toEqual(userMock)
    })

    it('should validate DTO', async () => {
      const dto = plainToInstance(CreateUserDto, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        password: 'Testy123!'
      })

      const errors = await validate(dto)

      expect(errors.length).toEqual(0)
    })

    it('should fail on invalid DTO', async () => {
      const dto = plainToInstance(CreateUserDto, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@emailcom',
        password: 'Testy123'
      })

      const errors = await validate(dto)

      expect(errors.length).not.toEqual(0)
      expect(errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ property: 'email' }),
          expect.objectContaining({ property: 'password' })
        ])
      )
    })
  })

  describe('Find a user', () => {
    it('should find a user', async () => {
      const result = await controller.findOne(1)

      expect(result).toBeInstanceOf(UserEntity)
      expect(result).toEqual(userMock)
    })

    it('should throw an error if user not found', async () => {
      usersServiceMock.findOne.mockResolvedValueOnce(null)

      await expect(controller.findOne(1)).rejects.toMatchObject({
        response: {
          error: 'Not Found',
          message: 'User not found',
          statusCode: 404
        }
      })
    })
  })

  describe('Update a user', () => {
    it('should update own user', async () => {
      const result = await controller.update(
        1,
        {
          firstName: 'New John'
        },
        {
          id: 1,
          role: 'USER'
        },
        responseMock
      )

      expect(authServiceMock.signIn).toBeCalled()
      expect(responseMock.cookie).toBeCalledWith(
        JWT_COOKIE_NAME,
        'accessToken',
        expect.any(Object)
      )

      expect(result).toBeInstanceOf(UserEntity)
      expect(result).toEqual({
        ...userMock,
        firstName: 'New John'
      })
    })

    it('should update another user', async () => {
      const result = await controller.update(
        1,
        {
          firstName: 'New John'
        },
        {
          id: 2,
          role: 'ADMIN'
        },
        responseMock
      )

      expect(authServiceMock.signIn).not.toBeCalled()
      expect(responseMock.cookie).not.toBeCalled()

      expect(result).toBeInstanceOf(UserEntity)
      expect(result).toEqual({
        ...userMock,
        firstName: 'New John'
      })
    })
  })

  describe('Delete a user', () => {
    it('should delete own user', async () => {
      const result = await controller.delete(
        1,
        {
          id: 1,
          role: 'USER'
        },
        responseMock
      )

      expect(responseMock.clearCookie).toBeCalledWith(JWT_COOKIE_NAME)

      expect(result).toBeUndefined()
    })

    it('should delete another user', async () => {
      const result = await controller.delete(
        1,
        {
          id: 2,
          role: 'ADMIN'
        },
        responseMock
      )

      expect(responseMock.clearCookie).not.toBeCalled()

      expect(result).toBeUndefined()
    })
  })
})
