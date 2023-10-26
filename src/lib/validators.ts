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
