import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class SignInDto {
  @ApiProperty({
    description: 'Email to sign in',
    example: 'john.doe@email.com'
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'Password to sign in',
    example: 'Your password'
  })
  @IsString()
  @IsNotEmpty()
  password: string
}
