export const authServiceMock = {
  validateUser: jest.fn().mockReturnValue({
    id: 1,
    role: 'USER'
  }),
  signIn: jest.fn().mockReturnValue({
    accessToken: 'accessToken'
  })
}
