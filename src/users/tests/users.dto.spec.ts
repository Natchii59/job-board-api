import { plainToInstance } from 'class-transformer'

import { CreateUserDto, UpdateUserDto } from '../dto/users.dto'

describe('Users DTO', () => {
  it('shoud create a CreateUserDto', () => {
    const dto = plainToInstance(CreateUserDto, {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      password: 'Testy123!'
    })

    expect(dto).toBeInstanceOf(CreateUserDto)
    expect(dto).toEqual({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@email.com',
      password: 'Testy123!'
    })
  })

  it('should create a UpdateUserDto', () => {
    const dto = plainToInstance(UpdateUserDto, {
      firstName: 'New John',
      lastName: 'New Doe',
      email: 'NEW.john.doe@email.com'
    })

    expect(dto).toBeInstanceOf(UpdateUserDto)
    expect(dto).toEqual({
      firstName: 'New John',
      lastName: 'New Doe',
      email: 'new.john.doe@email.com'
    })
  })
})
