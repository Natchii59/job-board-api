import { instanceToPlain } from 'class-transformer'

import { UserEntity } from '../entities/user.entity'
import { userMock } from './mocks/user.mock'

describe('Users Entity', () => {
  it('shoud create a UserEntity', () => {
    const user = instanceToPlain(new UserEntity(userMock))

    expect(user).not.toHaveProperty('password')
    expect(user).toHaveProperty('fullName', 'John Doe')
  })
})
