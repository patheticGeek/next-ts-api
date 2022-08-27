import { createApi } from "next-ts-api";

export const userHooks = createApi({
  getContext: () => ({ hello: 'hello' }),
  queries: {
    get: async (ctx, params: { name: string }) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { greeting: `${ctx.hello}, ${params.name}` }
    }
  },
  mutations: {
    create: async (ctx, params: { name: string }) => {
      await new Promise(resolve => setTimeout(resolve, 1500))
      return { greeting: `${ctx.hello}, ${params.name}` }
    }
  }
})
