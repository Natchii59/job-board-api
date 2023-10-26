import { ApiProperty } from '@nestjs/swagger'
import { Role, type Prisma } from '@prisma/client'
import { Transform } from 'class-transformer'
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsStrongPassword,
  MinLength,
  ValidateIf
} from 'class-validator'

import { IsOptionalNotNull } from '@/lib/validators'

export class CreateUserDto implements Prisma.UserCreateInput {
  @ApiProperty({
    minLength: 3,
    description: 'First name of the user',
    example: 'John'
  })
  @MinLength(3)
  firstName: string

  @ApiProperty({
    minLength: 3,
    description: 'Last name of the user',
    example: 'Doe'
  })
  @MinLength(3)
  lastName: string

  @ApiProperty({
    description: 'Email of the user',
    example: 'john.doe@email.com'
  })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string

  @ApiProperty({
    description: 'Password of the user',
    example: 'Testy123!'
  })
  @MinLength(8)
  @IsStrongPassword()
  password: string

  @ApiProperty({
    description: 'Birth date of the user',
    example: '2023-01-01',
    required: false,
    nullable: true
  })
  @IsDateString()
  @IsOptional()
  birthDate?: string

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+33612345678',
    required: false,
    nullable: true
  })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string
}

export class UpdateUserDto implements Prisma.UserUpdateInput {
  @ApiProperty({
    minLength: 3,
    description: 'First name of the user',
    example: 'John',
    required: false
  })
  @MinLength(3)
  @ValidateIf(IsOptionalNotNull)
  firstName?: string

  @ApiProperty({
    minLength: 3,
    description: 'Last name of the user',
    example: 'Doe',
    required: false
  })
  @MinLength(3)
  @ValidateIf(IsOptionalNotNull)
  lastName?: string

  @ApiProperty({
    description: 'Email of the user',
    example: 'john.doe@email.com',
    required: false
  })
  @IsEmail()
  @ValidateIf(IsOptionalNotNull)
  @Transform(({ value }) => (value ? value.toLowerCase() : value))
  email?: string

  @ApiProperty({
    description: 'Password of the user',
    example: 'Testy123!',
    required: false
  })
  @IsStrongPassword()
  @ValidateIf(IsOptionalNotNull)
  password?: string

  @ApiProperty({
    description: 'Birth date of the user',
    example: '2023-01-01',
    required: false,
    nullable: true
  })
  @IsDateString()
  @IsOptional()
  birthDate?: string

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+33612345678',
    required: false,
    nullable: true
  })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string

  @ApiProperty({
    description: 'Role of the user',
    enum: Role,
    example: Role.USER,
    required: false,
    nullable: true
  })
  @IsEnum(Role)
  @ValidateIf(IsOptionalNotNull)
  role?: Role
}
