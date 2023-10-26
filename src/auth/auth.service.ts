import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import type { UserPayload } from 'types'

import { Service } from '@/lib/constants'
import { compareHash } from '@/lib/hash'
import { UsersService } from '@/users/users.service'

@Injectable()
export class AuthService {
  constructor(
    @Inject(Service.USERS) private usersService: UsersService,
    @Inject(JwtService) private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<UserPayload> {
    const user = await this.usersService.findOne({ email })

    if (!user) return null

    const validPassword = await compareHash(password, user.password)

    if (!validPassword) return null

    return { id: user.id, role: user.role }
  }

  async signIn(payload: UserPayload) {
    const accessToken = await this.jwtService.signAsync(payload)
    return { accessToken }
  }
}
