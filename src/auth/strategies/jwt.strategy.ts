import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

import type { UserPayload } from 'types'

import { JWT_COOKIE_NAME } from '@/lib/constants'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJwtFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken()
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET
    })
  }

  async validate(payload: UserPayload): Promise<UserPayload> {
    return { id: payload.id, role: payload.role }
  }

  private static extractJwtFromCookie(req: Request): string | null {
    if (req.signedCookies && JWT_COOKIE_NAME in req.signedCookies)
      return req.signedCookies[JWT_COOKIE_NAME]

    return null
  }
}
