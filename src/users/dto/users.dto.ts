import { Prisma, Role } from '@prisma/client'
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
  @MinLength(3)
  firstName: string

  @MinLength(3)
  lastName: string

  @IsEmail()
  email: string

  @IsStrongPassword()
  password: string

  @IsDateString()
  @IsOptional()
  birthDate?: string

  @IsPhoneNumber()
  @IsOptional()
  phone?: string
}

export class UpdateUserDto implements Prisma.UserUpdateInput {
  @MinLength(3)
  @ValidateIf(IsOptionalNotNull)
  firstName?: string

  @MinLength(3)
  @ValidateIf(IsOptionalNotNull)
  lastName?: string

  @IsEmail()
  @ValidateIf(IsOptionalNotNull)
  email?: string

  @IsStrongPassword()
  @ValidateIf(IsOptionalNotNull)
  password?: string

  @IsDateString()
  @IsOptional()
  birthDate?: string

  @IsPhoneNumber()
  @IsOptional()
  phone?: string

  @IsEnum(Role)
  @ValidateIf(IsOptionalNotNull)
  role?: Role
}
