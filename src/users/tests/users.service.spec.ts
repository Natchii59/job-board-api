import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '@/database/prisma.service'
import { prismaMock } from '@/database/tests/mocks/prisma.mock'
import { Service } from '@/lib/constants'
import * as hashLib from '@/lib/hash'
import { CreateUserDto } from '../dto/users.dto'
import { UsersService } from '../users.service'
import { userMock } from './mocks/user.mock'

describe('UsersService', () => {
  let service: UsersService
  let prisma: PrismaService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: Service.PRISMA,
          useValue: prismaMock
        }
      ]
    }).compile()

    service = module.get<UsersService>(UsersService)
    prisma = module.get<PrismaService>(Service.PRISMA)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
    expect(prisma).toBeDefined()
  })

  describe('Create user', () => {
    it('should create a user', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null)

      jest.spyOn(hashLib, 'hash').mockResolvedValueOnce('hashedPassword')

      const input: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        password: 'Testy123!'
      }

      const result = await service.create(input)

      expect(prismaMock.user.create).toBeCalledWith({
        data: {
          ...input,
          password: 'hashedPassword'
        }
      })

      expect(result).toEqual(userMock)
    })

    it('should throw an error if email already exists', async () => {
      await expect(
        service.create({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          password: 'Testy123!'
        })
      ).rejects.toMatchObject({
        response: {
          error: 'Bad Request',
          message: 'Email already exists',
          statusCode: 400
        }
      })

      expect(prismaMock.user.create).not.toBeCalled()
    })
  })

  describe('Find user', () => {
    it('should find a user', async () => {
      const result = await service.findOne({ id: 1 })

      expect(result).toEqual(userMock)
    })

    it('should return null if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null)

      const result = await service.findOne({ id: 1 })

      expect(result).toBeNull()
    })
  })

  describe('Update user', () => {
    it('should update a user', async () => {
      const result = await service.update(
        {
          where: { id: 1 },
          data: { firstName: 'New John' }
        },
        { id: 1, role: 'USER' }
      )

      expect(result).toEqual({
        ...userMock,
        firstName: 'New John'
      })
    })

    it('should throw an error if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null)

      await expect(
        service.update(
          {
            where: { id: 1 },
            data: { firstName: 'New John' }
          },
          { id: 1, role: 'USER' }
        )
      ).rejects.toMatchObject({
        response: {
          error: 'Not Found',
          message: 'User not found',
          statusCode: 404
        }
      })

      expect(prismaMock.user.update).not.toBeCalled()
    })

    it('should throw an error if user is not authorized', async () => {
      await expect(
        service.update(
          {
            where: { id: 1 },
            data: { firstName: 'New John' }
          },
          { id: 2, role: 'USER' }
        )
      ).rejects.toMatchObject({
        response: {
          message: 'Unauthorized',
          statusCode: 401
        }
      })

      expect(prismaMock.user.update).not.toBeCalled()
    })

    it('should update a user if user is admin', async () => {
      const result = await service.update(
        {
          where: { id: 1 },
          data: { firstName: 'New John' }
        },
        { id: 2, role: 'ADMIN' }
      )

      expect(result).toEqual({
        ...userMock,
        firstName: 'New John'
      })
    })
  })

  describe('Delete user', () => {
    it('should delete a user', async () => {
      const result = await service.delete({ id: 1 }, { id: 1, role: 'USER' })

      expect(result).toEqual(userMock)
    })

    it('should throw an error if user does not exist', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null)

      await expect(
        service.delete({ id: 1 }, { id: 1, role: 'USER' })
      ).rejects.toMatchObject({
        response: {
          error: 'Not Found',
          message: 'User not found',
          statusCode: 404
        }
      })

      expect(prismaMock.user.delete).not.toBeCalled()
    })

    it('should throw an error if user is not authorized', async () => {
      await expect(
        service.delete({ id: 1 }, { id: 2, role: 'USER' })
      ).rejects.toMatchObject({
        response: {
          message: 'Unauthorized',
          statusCode: 401
        }
      })

      expect(prismaMock.user.delete).not.toBeCalled()
    })

    it('should delete a user if user is admin', async () => {
      const result = await service.delete({ id: 1 }, { id: 2, role: 'ADMIN' })

      expect(result).toEqual(userMock)
    })
  })
})
