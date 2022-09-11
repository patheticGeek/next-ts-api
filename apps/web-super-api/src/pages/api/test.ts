import { writeFileSync } from 'fs'
import { createApi } from 'next-super-api'

const userApi = createApi(async (params: { test: string }) => {
  writeFileSync('./test.txt', 'data')

  await new Promise((resolve) => setTimeout(resolve, 2000))

  return { status: 200, data: { test: params.test } }
})

export const getUser = userApi.fetcherMeta

export default userApi
