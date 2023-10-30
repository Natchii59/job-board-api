import { BadRequestException } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'

import { CreateUserDto } from '@/users/dto/users.dto'
import { IsOptionalNotNull, ValidationErrorPipe } from '../validators'

describe('Validators lib', () => {
  describe('ValidateIf IsOptionalNotNull', () => {
    it('should return true if value is not undefined', () => {
      expect(IsOptionalNotNull(null, 'value')).toBeTruthy()
      expect(IsOptionalNotNull(null, null)).toBeTruthy()
    })
  })

  describe('Validation Pipe', () => {
    it('should return BadRequestException with messages', async () => {
      const validation = new ValidationErrorPipe()

      await expect(
        validation.transform(<CreateUserDto>{}, {
          type: 'body',
          metatype: CreateUserDto,
          data: ''
        })
      ).rejects.toThrowError(BadRequestException)
    })

    it('should return validated object', async () => {
      const validation = new ValidationErrorPipe()

      const user = plainToInstance(CreateUserDto, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        password: 'Testy123!'
      })

      await expect(
        validation.transform(user, {
          type: 'body',
          metatype: CreateUserDto,
          data: ''
        })
      ).resolves.toEqual(user)
    })
  })
})
