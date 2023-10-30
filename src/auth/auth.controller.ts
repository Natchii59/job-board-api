import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Inject,
  Post,
  Res,
  UseGuards,
  UseInterceptors
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import type { Response } from 'express'

import type { UserPayload } from 'types'

import { JWT_COOKIE_NAME, Service } from '@/lib/constants'
import { CurrentUser, Public } from '@/lib/decarotars'
import { UserNotFoundException } from '@/lib/exceptions'
import { UserEntity } from '@/users/entities/user.entity'
import { UsersService } from '@/users/users.service'
import { AuthService } from './auth.service'
import { SignInDto } from './dto/auth.dto'
import { TokensEntity } from './entities/auth.entity'
import { LocalAuthGuard } from './guards/local-auth.guard'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(Service.AUTH) private authService: AuthService,
    @Inject(Service.USERS) private usersService: UsersService
  ) {}

  @ApiOperation({
    summary: 'Sign in',
    description: 'Sign in with email and password. A cookie will be set.'
  })
  @ApiBody({ description: 'Credentials for sign in', type: SignInDto })
  @ApiOkResponse({
    description: 'Tokens for sign in',
    type: TokensEntity,
    headers: {
      'Set-Cookie': {
        description: 'Cookie with JWT',
        schema: {
          type: 'string',
          example: 'jwt=abcde12345; Path=/; HttpOnly'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Invalid credentials'
  })
  @ApiBadRequestResponse({ description: 'Bad request - Validation failed' })
  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('sign-in')
  async signIn(
    @CurrentUser() user: UserPayload,
    @Res({ passthrough: true }) res: Response
  ): Promise<TokensEntity> {
    const tokens = await this.authService.signIn(user)

    res.cookie(JWT_COOKIE_NAME, tokens.accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      signed: true
    })

    return tokens
  }

  @ApiOperation({
    summary: 'Get user profile',
    description: 'Get profile of current user'
  })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'User profile', type: UserEntity })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Token is invalid or expired'
  })
  @ApiNotFoundResponse({ description: 'The token user does not exist' })
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('profile')
  async profile(@CurrentUser() currentUser: UserPayload): Promise<UserEntity> {
    const user = await this.usersService.findOne({ id: currentUser.id })

    if (!user) throw new UserNotFoundException()

    return new UserEntity(user)
  }

  @ApiOperation({
    summary: 'Sign out',
    description: 'Sign out. The cookie will be cleared.'
  })
  @ApiBearerAuth()
  @ApiNoContentResponse({
    description: 'User signed out',
    headers: {
      'Set-Cookie': {
        description: 'Cleared cookie with JWT',
        schema: {
          type: 'string',
          example: 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Token is invalid or expired'
  })
  @HttpCode(204)
  @Post('sign-out')
  signOut(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(JWT_COOKIE_NAME)
  }
}
