import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata
} from '@nestjs/common'

import { IS_PUBLIC_KEY } from './constants'

export const currentUserFactory = (
  _data: unknown,
  context: ExecutionContext
) => {
  return context.switchToHttp().getRequest().user
}

export const CurrentUser = createParamDecorator(currentUserFactory)

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
