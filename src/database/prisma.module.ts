import { Module } from '@nestjs/common'

import { Service } from '@/lib/constants'
import { PrismaService } from './prisma.service'

@Module({
  providers: [
    {
      provide: Service.PRISMA,
      useClass: PrismaService
    }
  ],
  exports: [Service.PRISMA]
})
export class PrismaModule {}
