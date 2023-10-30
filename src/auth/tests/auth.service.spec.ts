import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'

import { Service } from '@/lib/constants'
import * as hashLib from '@/lib/hash'
import { usersServiceMock } from '@/users/tests/mocks/users.service.mock'
import { UsersService } from '@/users/users.service'
import { AuthService } from '../auth.service'
import { jwtServiceMock } from './mocks/jwt.service.mock'

describe('AuthService', () => {
  let service: AuthService

  let usersService: UsersService
  let jwtService: JwtService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: Service.USERS,
          useValue: usersServiceMock
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock
        }
      ]
    }).compile()

    service = module.get<AuthService>(AuthService)
    usersService = module.get<UsersService>(Service.USERS)
    jwtService = module.get<JwtService>(JwtService)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(usersService).toBeDefined()
    expect(jwtService).toBeDefined()
  })

  describe('Validate user', () => {
    it('should validate a user', async () => {
      jest.spyOn(hashLib, 'compareHash').mockResolvedValueOnce(true)

      const result = await service.validateUser(
        'john.doe@email.com',
        'password'
      )

      expect(result).toEqual({
        id: 1,
        role: 'USER'
      })
    })

    it('should return null if user is not found', async () => {
      usersServiceMock.findOne.mockResolvedValueOnce(null)

      const result = await service.validateUser(
        'john.doe@email.com',
        'password'
      )

      expect(result).toBeNull()
    })

    it('should return null if password is invalid', async () => {
      jest.spyOn(hashLib, 'compareHash').mockResolvedValueOnce(false)

      const result = await service.validateUser(
        'john.doe@email.com',
        'password'
      )

      expect(result).toBeNull()
    })
  })

  describe('Sign in', () => {
    it('should sign in a user', async () => {
      const result = await service.signIn({
        id: 1,
        role: 'USER'
      })

      expect(result).toEqual({
        accessToken: 'accessToken'
      })
    })
  })
})
