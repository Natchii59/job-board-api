import { Role, User } from '@prisma/client'
import { Exclude, Expose } from 'class-transformer'

export class UserEntity implements User {
  id: number
  firstName: string
  lastName: string
  email: string
  birthDate: Date
  phone: string
  role: Role
  companyId: number

  createdAt: Date
  updatedAt: Date

  @Exclude()
  password: string

  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial)
  }
}
