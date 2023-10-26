import { ApiProperty } from '@nestjs/swagger'
import { Role, User } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'

export class UserEntity implements User {
  @ApiProperty({
    description: 'Id of the user',
    example: 1
  })
  id: number

  @ApiProperty({
    description: 'First name of the user',
    example: 'John'
  })
  firstName: string

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe'
  })
  lastName: string

  @ApiProperty({
    description: 'Email of the user',
    example: 'Email of the user'
  })
  email: string

  @ApiProperty({
    description: 'Birth date of the user',
    example: '2023-01-01',
    nullable: true
  })
  birthDate: Date

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+33612345678',
    nullable: true
  })
  phone: string

  @ApiProperty({
    description: 'Role of the user',
    enum: Role,
    example: Role.USER
  })
  role: Role

  @ApiProperty({
    description: 'Id of the company',
    example: 1,
    nullable: true
  })
  companyId: number

  @ApiProperty({
    description: 'Date of creation of the user',
    example: '2021-01-01'
  })
  createdAt: Date

  @ApiProperty({
    description: 'Date of update of the user',
    example: '2021-01-01'
  })
  updatedAt: Date

  @Exclude()
  password: string

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe'
  })
  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial)
  }
}
