import { Inject, Injectable } from '@nestjs/common'
import type { Prisma, User } from '@prisma/client'

import { PrismaService } from '@/database/prisma.service'
import { Service } from '@/lib/constants'
import { hash } from '@/lib/hash'
import { CreateUserDto } from './dto/users.dto'

@Injectable()
export class UsersService {
  constructor(@Inject(Service.PRISMA) private prisma: PrismaService) {}

  async create(data: CreateUserDto): Promise<User> {
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
    options: Pick<Prisma.UserUpdateArgs, 'data' | 'where'>
  ): Promise<User> {
    return this.prisma.user.update(options)
  }

  async delete(where: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.delete({ where })
  }
}
