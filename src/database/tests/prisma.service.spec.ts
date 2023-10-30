import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '@/database/prisma.service'

describe('UsersService', () => {
  let service: PrismaService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService]
    }).compile()

    service = module.get<PrismaService>(PrismaService)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NODE_ENV = 'test'
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should connect to database', async () => {
    const connectSpy = jest.spyOn(service, '$connect')

    await service.onModuleInit()

    expect(connectSpy).toBeCalled()
  })

  it('should clean database in test env', async () => {
    const prismaUserSpy = jest
      .spyOn(service.user, 'deleteMany')
      .mockImplementation()

    await service.cleanDatabase()

    expect(prismaUserSpy).toBeCalled()
  })

  it('should not clean database in production env', async () => {
    process.env.NODE_ENV = 'production'

    const prismaUserSpy = jest
      .spyOn(service.user, 'deleteMany')
      .mockImplementation()

    await service.cleanDatabase()

    expect(prismaUserSpy).not.toBeCalled()
  })
})
