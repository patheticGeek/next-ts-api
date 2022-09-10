import { writeFileSync } from "fs";
import { createApi } from "next-super-api";

const userApi = createApi(async (params: { test: string }) => {
  writeFileSync('./test.txt', 'data')
  return { status: 200, data: { test: params.test } }
})

export const getUser = userApi.fetcher

export default userApi
