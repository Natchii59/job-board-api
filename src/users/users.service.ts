import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { Role, type Prisma, type User } from '@prisma/client'

import { UserPayload } from 'types'

import { PrismaService } from '@/database/prisma.service'
import { Service } from '@/lib/constants'
import { UserNotFoundException } from '@/lib/exceptions'
import { hash } from '@/lib/hash'
import { CreateUserDto } from './dto/users.dto'

@Injectable()
export class UsersService {
  constructor(@Inject(Service.PRISMA) private prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email }
    })

    if (user) throw new BadRequestException('Email already exists')

    const hashedPassword = await hash(data.password)

    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      }
    })
  }

  async findOne(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({ where })
  }

  async update(
    options: Pick<Prisma.UserUpdateArgs, 'data' | 'where'>,
    currentUser: UserPayload
  ): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: options.where })

    if (!user) throw new UserNotFoundException()

    if (currentUser.id !== user.id && currentUser.role === Role.USER)
      throw new UnauthorizedException()

    return this.prisma.user.update(options)
  }

  async delete(where: Prisma.UserWhereUniqueInput, currentUser: UserPayload) {
    const user = await this.prisma.user.findUnique({ where })

    if (!user) throw new UserNotFoundException()

    if (currentUser.id !== user.id && currentUser.role === Role.USER)
      throw new UnauthorizedException()

    return this.prisma.user.delete({ where })
  }
}
