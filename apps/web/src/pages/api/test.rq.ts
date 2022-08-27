import { createApi } from "next-ts-api";

export const useUser = createApi({
  getContext: () => ({ hello: 'hello' }),
  queries: {
    get: async (ctx, params: { name: string }) => {
      return { greeting: `${ctx.hello}, ${params.name}` }
    }
  },
  mutations: {
    create: async (ctx, params: { name: string }) => {
      return { greeting: `${ctx.hello}, ${params.name}` }
    }
  }
})
