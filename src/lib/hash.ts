import { genSalt, hash as hashBcrypt } from 'bcrypt'

export async function hash(data: string): Promise<string> {
  const salt = await genSalt()
  return hashBcrypt(data, salt)
}
