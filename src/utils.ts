export const createToken = (length = 10): string => {
  let result = ''
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  while (result.length < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}
