import { BadRequestException, ValidationPipe } from '@nestjs/common'
import { ValidationError } from 'class-validator'

export const IsOptionalNotNull = (_object: any, value: any) =>
  value !== undefined

export function validationErrorsMessages(errors: ValidationError[]) {
  return errors.map(error => {
    return {
      path: error.property,
      messages: Object.values(error.constraints)
    }
  })
}

export class ValidationErrorPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      exceptionFactory(errors) {
        const messages = validationErrorsMessages(errors)
        return new BadRequestException(messages)
      }
    })
  }
}
