import { compare, genSalt, hash as hashBcrypt } from 'bcrypt'

export async function hash(data: string): Promise<string> {
  const salt = await genSalt()
  return hashBcrypt(data, salt)
}

export async function compareHash(
  data: string,
  hashedData: string
): Promise<boolean> {
  return compare(data, hashedData)
}
