import { createMock, DeepMocked } from '@golevelup/ts-jest'
import { ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'

import { AuthModule } from '@/auth/auth.module'
import { AuthService } from '@/auth/auth.service'
import { JWT_COOKIE_NAME, Service } from '@/lib/constants'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard

  let reflectorMock: DeepMocked<Reflector>

  let jwtToken: string

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AuthModule]
    }).compile()

    const authService = module.get<AuthService>(Service.AUTH)

    const tokens = await authService.signIn({
      id: 1,
      role: 'USER'
    })
    jwtToken = tokens.accessToken

    reflectorMock = createMock<Reflector>()
    reflectorMock.getAllAndOverride.mockReturnValue(false)

    jwtAuthGuard = new JwtAuthGuard(reflectorMock)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(jwtAuthGuard).toBeDefined()
  })

  describe('Authorization header', () => {
    it('should return true', async () => {
      const context = createMock<ExecutionContext>()
      context.switchToHttp().getRequest.mockReturnValueOnce({
        headers: {
          authorization: `Bearer ${jwtToken}`
        }
      })

      const result = await jwtAuthGuard.canActivate(context)

      expect(result).toBeTruthy()
    })

    it('should return false', async () => {
      const context = createMock<ExecutionContext>()
      context.switchToHttp().getRequest.mockReturnValueOnce({
        headers: {
          authorization: `Bearer wrong-token`
        }
      })

      await expect(jwtAuthGuard.canActivate(context)).rejects.toThrowError(
        UnauthorizedException
      )
    })

    it('should return if public', async () => {
      const context = createMock<ExecutionContext>()
      context.switchToHttp().getRequest.mockReturnValueOnce({
        headers: {
          authorization: `Bearer wrong-token`
        }
      })

      reflectorMock.getAllAndOverride.mockReturnValueOnce(true)

      const result = await jwtAuthGuard.canActivate(context)

      expect(result).toBeTruthy()
    })
  })

  describe('Cookie', () => {
    it('should return true', async () => {
      const context = createMock<ExecutionContext>()
      context.switchToHttp().getRequest.mockReturnValueOnce({
        signedCookies: {
          [JWT_COOKIE_NAME]: jwtToken
        }
      })

      const result = await jwtAuthGuard.canActivate(context)

      expect(result).toBeTruthy()
    })

    it('should return false', async () => {
      const context = createMock<ExecutionContext>()
      context.switchToHttp().getRequest.mockReturnValueOnce({
        signedCookies: {
          [JWT_COOKIE_NAME]: 'wrong-token'
        }
      })

      await expect(jwtAuthGuard.canActivate(context)).rejects.toThrowError(
        UnauthorizedException
      )
    })

    it('should return if public', async () => {
      const context = createMock<ExecutionContext>()
      context.switchToHttp().getRequest.mockReturnValueOnce({
        signedCookies: {
          [JWT_COOKIE_NAME]: 'wrong-token'
        }
      })

      reflectorMock.getAllAndOverride.mockReturnValueOnce(true)

      const result = await jwtAuthGuard.canActivate(context)

      expect(result).toBeTruthy()
    })
  })
})
