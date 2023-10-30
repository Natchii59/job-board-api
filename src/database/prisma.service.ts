import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect()
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return

    await this.user.deleteMany()
  }
}
