import { ApiProperty } from '@nestjs/swagger'

export class TokensEntity {
  @ApiProperty({
    description: 'Access token',
    example: '<token>'
  })
  accessToken: string
}
