import { User } from '@prisma/client'

export const userMock: User = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@email.com',
  password: 'hashedPassword',
  role: 'USER',
  birthDate: null,
  phone: null,
  companyId: null,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01')
}
