import { Module } from '@nestjs/common'

import { PrismaService } from '@/database/prisma.service'
import { Service } from '@/lib/constants'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  providers: [
    {
      provide: Service.PRISMA,
      useClass: PrismaService
    },
    {
      provide: Service.USERS,
      useClass: UsersService
    }
  ],
  controllers: [UsersController]
})
export class UsersModule {}
