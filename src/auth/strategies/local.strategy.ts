import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { validate } from 'class-validator'
import { Strategy } from 'passport-local'

import { UserPayload } from 'types'

import { Service } from '@/lib/constants'
import { validationErrorsMessages } from '@/lib/validators'
import { AuthService } from '../auth.service'
import { SignInDto } from '../dto/auth.dto'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject(Service.AUTH) private authService: AuthService) {
    super({
      usernameField: 'email'
    })
  }

  async validate(email: string, password: string): Promise<UserPayload> {
    await LocalStrategy.validateDto({ email, password })

    const user = await this.authService.validateUser(email, password)

    if (!user) throw new UnauthorizedException()

    return user
  }

  private static async validateDto(data: SignInDto): Promise<void> {
    const dto = new SignInDto()
    dto.email = data.email
    dto.password = data.password

    const errors = await validate(dto)
    if (errors.length) {
      const messages = validationErrorsMessages(errors)
      throw new BadRequestException(messages)
    }
  }
}
