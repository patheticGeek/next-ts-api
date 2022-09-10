import { useFetcher } from './fetcher'
import {
  useQuery as useReactQuery,
  useMutation as useReactMutation
} from '@tanstack/react-query'
import { GSSPContext } from './react-query'
import { CreateApiSliceOptions, Mutations, Queries } from '../createApi'

export const createUseQuery =
  (route: string, key: string) => (data: any, options: any) => {
    const fetcher = useFetcher()
    return useReactQuery(
      [key, data],
      async ({ signal }) =>
        fetcher({ route, type: 'query', key, data, signal }),
      options
    )
  }

export const createUseMutation =
  (route: string, key: string) => (options: any) => {
    const fetcher = useFetcher()
    return useReactMutation(
      [key],
      async (data: any) => fetcher({ route, type: 'mutation', key, data }),
      options
    )
  }

export const createServerFuncs = <
  SliceContextFnResult extends any | undefined,
  SliceQueries extends Queries<SliceContextFnResult>,
  SliceMutations extends Mutations<SliceContextFnResult>
>(
  options: CreateApiSliceOptions<
    SliceContextFnResult,
    SliceQueries,
    SliceMutations
  >
) => {
  const { getContext, queries, mutations } = options
  const funcs: Record<string, Function> = {}

  Object.entries(queries).forEach(([key]) => {
    funcs[`${key}Query`] = async (
      { req, queryClient }: Pick<GSSPContext, 'req' | 'queryClient'>,
      data: any
    ) => {
      const context = getContext
        ? await getContext({ type: 'server', req })
        : undefined

      const handler = queries[key]
      const result = await handler(context as any, data)

      queryClient.prefetchQuery([key, data], () => result)
      return result
    }
  })

  Object.entries(mutations).forEach(([key]) => {
    funcs[`${key}Mutation`] = async (
      { req, queryClient }: Pick<GSSPContext, 'req' | 'queryClient'>,
      data: any
    ) => {
      const context = getContext
        ? await getContext({ type: 'server', req })
        : undefined

      const handler = queries[key]
      const result = await handler(context as any, data)

      queryClient.prefetchQuery([key, data], () => result)
      return result
    }
  })

  return funcs
}
