import { userMock } from './user.mock'

export const usersServiceMock = {
  create: jest.fn().mockReturnValue(userMock),
  findOne: jest.fn().mockReturnValue(userMock),
  update: jest.fn().mockReturnValue({
    ...userMock,
    firstName: 'New John'
  }),
  delete: jest.fn().mockReturnValue(userMock)
}
