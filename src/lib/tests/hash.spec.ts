import { compareHash, hash } from '../hash'

describe('Hash lib', () => {
  it('should hash a password', async () => {
    const hashed = await hash('password')

    expect(hashed).toEqual(expect.any(String))
    expect(hashed).not.toEqual('password')
  })

  it('should compare a password', async () => {
    const hashed = await hash('password')

    const result = await compareHash('password', hashed)

    expect(result).toBe(true)
  })
})
