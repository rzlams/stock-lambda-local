const base64ToString = (data: string) => Buffer.from(data, 'base64').toString('ascii')

export const getJwtBody = (token: string) => {
  if (!token || typeof token !== 'string') return {}

  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    base64ToString(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join('')
  )

  return JSON.parse(jsonPayload)
}
