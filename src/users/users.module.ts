import { forwardRef, Module } from '@nestjs/common'

import { AuthModule } from '@/auth/auth.module'
import { PrismaModule } from '@/database/prisma.module'
import { Service } from '@/lib/constants'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  imports: [PrismaModule, forwardRef(() => AuthModule)],
  providers: [
    {
      provide: Service.USERS,
      useClass: UsersService
    }
  ],
  controllers: [UsersController],
  exports: [Service.USERS]
})
export class UsersModule {}
