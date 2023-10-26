import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Res
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse
} from '@nestjs/swagger'
import { Response } from 'express'

import type { UserPayload } from 'types'

import { AuthService } from '@/auth/auth.service'
import { JWT_COOKIE_NAME, Service } from '@/lib/constants'
import { CurrentUser, Public } from '@/lib/decarotars'
import { UserNotFoundException } from '@/lib/exceptions'
import { CreateUserDto, UpdateUserDto } from './dto/users.dto'
import { UserEntity } from './entities/user.entity'
import { UsersService } from './users.service'

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    @Inject(Service.USERS) private usersService: UsersService,
    @Inject(Service.AUTH) private authService: AuthService
  ) {}

  @ApiOperation({
    summary: 'Create user',
    description: 'Create a new user'
  })
  @ApiBody({
    description: 'User data to create',
    type: CreateUserDto
  })
  @ApiCreatedResponse({ description: 'User created', type: UserEntity })
  @ApiBadRequestResponse({ description: 'Bad request - Validation failed' })
  @Public()
  @Post()
  async create(@Body() data: CreateUserDto): Promise<UserEntity> {
    const createdUser = await this.usersService.create(data)

    return new UserEntity(createdUser)
  }

  @ApiOperation({
    summary: 'Find a user',
    description: 'Find a user by id'
  })
  @ApiParam({
    name: 'id',
    description: 'Id of the user',
    example: 1
  })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Details of the user', type: UserEntity })
  @ApiNotFoundResponse({
    description: 'The user with this id could not be found'
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized - Token is invalid or expired'
  })
  @ApiBadRequestResponse({ description: 'Bad request - Validation failed' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    const user = await this.usersService.findOne({ id })

    if (!user) throw new UserNotFoundException()

    return new UserEntity(user)
  }

  @ApiOperation({
    summary: 'Update user',
    description:
      'Update a user by id. If you are updating your own user, a new token will be set. You can update the user if you are an admin or if you are updating your own user.'
  })
  @ApiParam({
    name: 'id',
    description: 'Id of the user',
    example: 1
  })
  @ApiBody({
    description: 'User data to update',
    type: UpdateUserDto
  })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'User updated',
    type: UserEntity,
    headers: {
      'Set-Cookie': {
        description:
          'Updated cookie with JWT (if you are updating your own user)',
        schema: {
          type: 'string',
          example: 'jwt=abcde12345; Path=/; HttpOnly'
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'The user with this id could not be found'
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized - Token is invalid or you do not have permissions to update this user'
  })
  @ApiBadRequestResponse({ description: 'Bad request - Validation failed' })
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserDto,
    @CurrentUser() currentUser: UserPayload,
    @Res({ passthrough: true }) res: Response
  ): Promise<UserEntity> {
    const updatedUser = await this.usersService.update(
      {
        where: { id },
        data
      },
      currentUser
    )

    if (updatedUser.id === currentUser.id) {
      const tokens = await this.authService.signIn({
        id: updatedUser.id,
        role: updatedUser.role
      })

      res.cookie(JWT_COOKIE_NAME, tokens.accessToken, {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        signed: true
      })
    }

    return new UserEntity(updatedUser)
  }

  @ApiOperation({
    summary: 'Delete user',
    description:
      'Delete a user by id. If you are deleting your own user, the cookie will be cleared. You can delete the user if you are an admin or if you are deleting your own user.'
  })
  @ApiParam({
    name: 'id',
    description: 'Id of the user',
    example: 1
  })
  @ApiBearerAuth()
  @ApiNoContentResponse({
    description: 'User was deleted',
    headers: {
      'Set-Cookie': {
        description:
          'Cleared cookie with JWT (if you are deleting your own user)',
        schema: {
          type: 'string',
          example: 'jwt=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'The user with this id could not be found'
  })
  @ApiUnauthorizedResponse({
    description:
      'Unauthorized - Token is invalid or you do not have permissions to delete this user'
  })
  @ApiBadRequestResponse({ description: 'Bad request - Validation failed' })
  @HttpCode(204)
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: UserPayload,
    @Res() res: Response
  ): Promise<void> {
    const deletedUser = await this.usersService.delete({ id }, currentUser)

    if (deletedUser.id === currentUser.id) {
      res.clearCookie(JWT_COOKIE_NAME)
    }
  }
}
