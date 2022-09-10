import {
  useQuery as useReactQuery,
  useMutation as useReactMutation,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query'
import { ApiError } from '../ApiError'
import { ApiFetcher, HandlerParams, HandlerResult } from '../types'

export const useQuery = <
  Params extends HandlerParams,
  Result extends HandlerResult
>(
  fetcher: ApiFetcher<Params, Result>,
  params: Params,
  options?: UseQueryOptions<
    Result['data'],
    ApiError<Params, Result> | undefined,
    Result,
    readonly [string, Params]
  >
) => {
  const { data, ...others } = useReactQuery<
    Result['data'],
    ApiError<Params, Result> | undefined,
    Result['data'],
    readonly [string, Params]
  >(
    [fetcher._routePath, params] as const,
    async () => (await fetcher(params)).data, // TODO use signal
    options
  )
  return [data, others] as const
}

export const useMutation = <
  Params extends HandlerParams,
  Result extends HandlerResult
>(
  fetcher: ApiFetcher<Params, Result>,
  options?: UseMutationOptions<
    Result['data'],
    ApiError<Params, Result> | undefined,
    Params,
    readonly [string]
  >
) => {
  const { mutateAsync, ...others } = useReactMutation<
    Result['data'],
    ApiError<Params, Result> | undefined,
    Params,
    readonly [string]
  >(
    [fetcher._routePath] as const,
    async (data: Params) => (await fetcher(data)).data,
    options
  )
  return [mutateAsync, others] as const
}
