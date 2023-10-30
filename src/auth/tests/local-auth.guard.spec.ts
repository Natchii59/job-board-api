import { createMock } from '@golevelup/ts-jest'
import {
  BadRequestException,
  ExecutionContext,
  UnauthorizedException
} from '@nestjs/common'
import { Test } from '@nestjs/testing'

import { AuthModule } from '@/auth/auth.module'
import { authServiceMock } from '@/auth/tests/mocks/auth.service.mock'
import { Service } from '@/lib/constants'
import { LocalAuthGuard } from '../guards/local-auth.guard'

describe('LocalAuthGuard', () => {
  let localAuthGuard: LocalAuthGuard

  beforeAll(async () => {
    await Test.createTestingModule({
      imports: [AuthModule]
    })
      .overrideProvider(Service.AUTH)
      .useValue(authServiceMock)
      .compile()

    localAuthGuard = new LocalAuthGuard()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(localAuthGuard).toBeDefined()
  })

  it('should return true if user is authenticated', async () => {
    const context = createMock<ExecutionContext>()
    context.switchToHttp().getRequest.mockReturnValue({
      body: {
        email: 'john.doe@email.com',
        password: 'Testy123!'
      }
    })

    await expect(localAuthGuard.canActivate(context)).resolves.toBeTruthy()
  })

  it('should throw an error if user is not authenticated', async () => {
    const context = createMock<ExecutionContext>()
    context.switchToHttp().getRequest.mockReturnValue({
      body: {
        email: 'john.doe@email.com',
        password: 'Testy123!'
      }
    })

    authServiceMock.validateUser.mockReturnValueOnce(null)

    await expect(localAuthGuard.canActivate(context)).rejects.toThrowError(
      UnauthorizedException
    )
  })

  it('should throw an error if email or password is invalid', async () => {
    const context = createMock<ExecutionContext>()
    context.switchToHttp().getRequest.mockReturnValue({
      body: {
        email: 'not-an-email',
        password: 123
      }
    })

    await expect(localAuthGuard.canActivate(context)).rejects.toThrowError(
      BadRequestException
    )
  })
})
