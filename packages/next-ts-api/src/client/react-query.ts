import {
  dehydrate,
  QueryClient,
  QueryClientConfig,
  useMutation as useReactMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery as useReactQuery,
  UseQueryOptions,
  UseQueryResult
} from '@tanstack/react-query'
import { ParsedUrlQuery } from 'querystring'
import { useState } from 'react'

import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  PreviewData
} from 'next'

/**
 * React query types
 */
 export type UseTypedQuery<
 Data extends any,
 Result extends any,
 Error extends unknown = unknown
> = (
 data: Data,
 options?: Omit<UseQueryOptions<Result, Error>, 'queryKey' | 'queryFn'>
) => UseQueryResult<Result, Error>

export type UseTypedMutation<
 Data extends any,
 Result extends any,
 Error extends unknown = unknown
> = (
 options?: Omit<
   UseMutationOptions<Result, Error, Data>,
   'mutationKey' | 'mutationFn'
 >
) => UseMutationResult<Result, Error, Data>

export type GetServerSidePropsWithQueryClient<
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
> = (
  queryClient: QueryClient,
  context: GetServerSidePropsContext<Q, D>
) => Promise<GetServerSidePropsResult<P>>

export const withQueryClient = (
  fn: GetServerSidePropsWithQueryClient,
  queryClientConfig?: QueryClientConfig
): GetServerSideProps => {
  const queryClient = new QueryClient(queryClientConfig)

  return async (ctx) => {
    const result = await fn(queryClient, ctx)
    Object.assign(result, {
      props: { queryClientState: dehydrate(queryClient) }
    })
    return result
  }
}

export const useCreateQueryClient = (queryClientConfig?: QueryClientConfig) => {
  return useState(new QueryClient(queryClientConfig))[0]
}
