import { createApi } from "next-ts-api";

const userApi = createApi({
  getContext: () => ({ hello: 'hello' }),
  queries: {
    getUser: async (ctx, params: { name: string }) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { greeting: `${ctx.hello}, ${params.name}` }
    }
  },
  mutations: {
    createUser: async (ctx, params: { name: string }) => {
      await new Promise(resolve => setTimeout(resolve, 1500))
      return { greeting: `${ctx.hello}, ${params.name}` }
    }
  }
})

export const { useCreateUserMutation, useGetUserQuery } = userApi.client
