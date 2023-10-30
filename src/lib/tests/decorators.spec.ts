import { createMock } from '@golevelup/ts-jest'
import { ExecutionContext } from '@nestjs/common'

import { currentUserFactory } from '../decarotars'

describe('Decorators lib', () => {
  it('should return current user', () => {
    const context = createMock<ExecutionContext>()
    context.switchToHttp().getRequest.mockReturnValue({
      user: {
        id: 1,
        role: 'USER'
      }
    })

    const result = currentUserFactory(null, context)

    expect(result).toEqual({
      id: 1,
      role: 'USER'
    })
  })
})
