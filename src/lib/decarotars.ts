import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata
} from '@nestjs/common'
import { Role } from '@prisma/client'

import { IS_PUBLIC_KEY, ROLES_KEY } from './constants'

export const CurrentUser = createParamDecorator(
  async (_data: unknown, context: ExecutionContext) => {
    return context.switchToHttp().getRequest().user
  }
)

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)
