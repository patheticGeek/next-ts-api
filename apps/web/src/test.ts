export const test = {
  getContext: async () => {
    return ({ hello: 'hello' })
  },
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
}