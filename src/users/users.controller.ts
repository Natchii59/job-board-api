import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseInterceptors
} from '@nestjs/common'

import { Service } from '@/lib/constants'
import { UserNotFoundException } from '@/lib/exceptions'
import { CreateUserDto, UpdateUserDto } from './dto/users.dto'
import { UserEntity } from './entities/user.entity'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(@Inject(Service.USERS) private usersService: UsersService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async create(@Body() data: CreateUserDto): Promise<UserEntity> {
    const user = await this.usersService.findOne({ email: data.email })

    if (user) throw new BadRequestException('Email already exists')

    const createdUser = await this.usersService.create(data)

    return new UserEntity(createdUser)
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<UserEntity> {
    const user = await this.usersService.findOne({ id })

    if (!user) throw new UserNotFoundException()

    return new UserEntity(user)
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUserDto
  ): Promise<UserEntity> {
    const user = await this.usersService.findOne({ id })

    if (!user) throw new UserNotFoundException()

    const updatedUser = await this.usersService.update({
      where: { id },
      data
    })

    return new UserEntity(updatedUser)
  }

  @HttpCode(204)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    const user = await this.usersService.findOne({ id })

    if (!user) throw new UserNotFoundException()

    await this.usersService.delete({ id })
  }
}
