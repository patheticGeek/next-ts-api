import type { NextApiHandler } from 'next'
import type { Queries, Mutations, CreateApiSliceOptions } from './createApi'

export const createApiHandler = <
  SliceContextFnResult extends any | undefined,
  SliceQueries extends Queries<SliceContextFnResult>,
  SliceMutations extends Mutations<SliceContextFnResult>
>(
  options: CreateApiSliceOptions<
    SliceContextFnResult,
    SliceQueries,
    SliceMutations
  >
): NextApiHandler => {
  const { getContext, queries, mutations } = options

  const apiHandler: NextApiHandler = async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: `Only "POST" method not allowed` })
      return
    }

    const { type, key } = req.query
    if (typeof type !== 'string' || typeof key !== 'string') {
      res.status(404).json({ error: `"type" & "key" params should be string` })
      return
    }

    const handler =
      type === 'query'
        ? queries[key]
        : type === 'mutation'
        ? mutations[key]
        : undefined
    if (!handler) {
      res.status(404).json({ error: `No ${type}.${key}` })
      return
    }

    const context = getContext
      ? await getContext({ type: 'client', req })
      : undefined

    const data = req.body.data
    const result = await handler(context as SliceContextFnResult, data)

    res.status(200).json({ result })
  }

  return apiHandler
}
