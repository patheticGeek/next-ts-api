import { writeFileSync } from 'fs'
import { createApi } from 'next-super-api'

const userApi = createApi(async ({ type, req }, params: { test: string }) => {
  if (type === 'client') {
    // api called from client
  } else if (type === 'ssr') {
    // api called in ssr
  }

  const { headers, cookies } = req
  console.log('userApi -> headers, cookies', headers, cookies)

  writeFileSync('./test.txt', 'data')

  await new Promise((resolve) => setTimeout(resolve, 2000))

  return { status: 200, data: { test: params.test } }
})

export const getUser = userApi.fetcherMeta

export default userApi
