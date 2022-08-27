import type { NextApiHandler } from "next"
import type { Queries, Mutations, CreateApiSliceOptions } from "./createApi"

export const createApiHandler = <
  SliceContextFnResult extends any | undefined,
  SliceQueries extends Queries<SliceContextFnResult>,
  SliceMutations extends Mutations<SliceContextFnResult>
>(
  options: CreateApiSliceOptions<SliceContextFnResult, SliceQueries, SliceMutations>
): NextApiHandler => {
  const { getContext, queries, mutations } = options
  
  const apiHandler: NextApiHandler = async (req, res) => {
    const { type, action } = req.query
    if(typeof type !== 'string' || typeof action !== 'string') {
      res.status(404).json({ error: `type & action params should be string` })
      return
    }

    const data = req.body
    console.log(`action: ${action}, type: ${type},\ndata: ${JSON.stringify(data)}`)

    const handler = type === 'query' ? queries[action] : type === 'mutation' ? mutations[action] : undefined
    if (!handler) {
      res.status(404).json({ error: `No action ${action} in ${type}` })
      return
    }

    const context = getContext
      ? await getContext({ type: 'client', req })
      : undefined

    console.log('handler', context, data)
    const result = await handler(context as SliceContextFnResult, data)

    res.status(200).json(result)
  }

  return apiHandler
}
