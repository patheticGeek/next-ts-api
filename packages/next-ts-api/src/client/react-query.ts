import {
  dehydrate,
  QueryClient,
  QueryClientConfig,
  UseMutationOptions,
  UseMutationResult,
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

export type GSSPContext<
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
> = GetServerSidePropsContext<Q, D> & { queryClient: QueryClient }

export type GetServerSidePropsWithQueryClient<
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
> = (
  context: GSSPContext<Q, D>
) => Promise<GetServerSidePropsResult<P>>

export const gSSPWithQueryClient = (
  fn: GetServerSidePropsWithQueryClient,
  queryClientConfig?: QueryClientConfig
): GetServerSideProps => {
  const queryClient = new QueryClient(queryClientConfig)

  return async (ctx) => {
    const result = await fn({ ...ctx, queryClient })
    Object.assign(result, {
      props: { queryClientState: dehydrate(queryClient) }
    })
    return result
  }
}

/**
 * Helper to be used in `_app.tsx` to create query client.
 * ```ts
    const queryClient = useCreateQueryClient()
    return (
      <NextTsApiProvider queryClient={queryClient} pageProps={pageProps}>
        {children}
      </NextTsApiProvider>
    )
 * ```
 */
export const useCreateQueryClient = (queryClientConfig?: QueryClientConfig) => {
  return useState(() => new QueryClient(queryClientConfig))[0]
}
