import { userMock } from '@/users/tests/mocks/user.mock'

export const prismaMock = {
  user: {
    create: jest.fn().mockReturnValue(userMock),
    findUnique: jest.fn().mockReturnValue(userMock),
    update: jest.fn().mockReturnValue({
      ...userMock,
      firstName: 'New John'
    }),
    delete: jest.fn().mockReturnValue(userMock)
  }
}
