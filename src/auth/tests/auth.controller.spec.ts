import { Test, TestingModule } from '@nestjs/testing'
import { Response } from 'express'

import { JWT_COOKIE_NAME, Service } from '@/lib/constants'
import { UserEntity } from '@/users/entities/user.entity'
import { userMock } from '@/users/tests/mocks/user.mock'
import { usersServiceMock } from '@/users/tests/mocks/users.service.mock'
import { UsersService } from '@/users/users.service'
import { AuthController } from '../auth.controller'
import { AuthService } from '../auth.service'
import { authServiceMock } from './mocks/auth.service.mock'

describe('AuthController', () => {
  let controller: AuthController

  let authService: AuthService
  let usersService: UsersService

  const responseMock = {
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis()
  } as unknown as Response

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: Service.AUTH,
          useValue: authServiceMock
        },
        {
          provide: Service.USERS,
          useValue: usersServiceMock
        }
      ]
    }).compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get<AuthService>(Service.AUTH)
    usersService = module.get<UsersService>(Service.USERS)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
    expect(authService).toBeDefined()
    expect(usersService).toBeDefined()
  })

  describe('Sign in', () => {
    it('should sign in a user', async () => {
      const result = await controller.signIn(
        {
          id: 1,
          role: 'USER'
        },
        responseMock
      )

      expect(responseMock.cookie).toBeCalledWith(
        JWT_COOKIE_NAME,
        'accessToken',
        expect.any(Object)
      )

      expect(result).toEqual({
        accessToken: 'accessToken'
      })
    })
  })

  describe('Profile', () => {
    it('should return the current user', async () => {
      const result = await controller.profile({
        id: 1,
        role: 'USER'
      })

      expect(result).toBeInstanceOf(UserEntity)
      expect(result).toEqual(userMock)
    })

    it('should throw an error if the user does not exist', async () => {
      usersServiceMock.findOne.mockResolvedValueOnce(null)

      await expect(
        controller.profile({
          id: 1,
          role: 'USER'
        })
      ).rejects.toMatchObject({
        response: {
          error: 'Not Found',
          message: 'User not found',
          statusCode: 404
        }
      })
    })
  })

  describe('Sign out', () => {
    it('should sign out a user', async () => {
      controller.signOut(responseMock)

      expect(responseMock.clearCookie).toBeCalledWith(JWT_COOKIE_NAME)
    })
  })
})
