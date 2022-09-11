import {
  dehydrate,
  FetchQueryOptions,
  Hydrate,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import { ApiError } from './ApiError'
import {
  useQuery as useReactQuery,
  useMutation as useReactMutation,
  UseQueryOptions,
  UseMutationOptions
} from '@tanstack/react-query'
import {
  CreateClientsParams,
  FetcherMeta,
  FetcherParams,
  HandlerParams,
  HandlerResult
} from '../types'
import { ParsedUrlQuery } from 'querystring'
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  PreviewData
} from 'next/types'
import React from 'react'
import { AppProps } from 'next/app'

const defaultFetcher = async (params: FetcherParams) => {
  const res = await fetch(params.route, {
    method: params.method,
    body: params.body
  })
  const result = await res.json()
  return result
}

export const createClients = ({
  queryClient: queryClientConfig,
  fetcher: userFetcher = defaultFetcher
}: CreateClientsParams) => {
  /**
   * React-query client
   */
  const queryClient = new QueryClient(queryClientConfig)

  const wrappedUserFetch = async (params: {
    route: string
    method: string
    data: any
  }) => {
    const result = await userFetcher({
      route: params.route,
      method: params.method,
      body: JSON.stringify({ data: params.data })
    })
    if (result.status < 200 || result.status > 299) {
      throw new ApiError('Api error occurred', params, result)
    }
    return result.data
  }

  /**
   * Fetcher function is used when you want to run queries outside of react land
   */
  const fetcher = async <
    Params extends HandlerParams,
    Result extends HandlerResult
  >(
    fetcherMeta: FetcherMeta<Params, Result>,
    params: Params,
    options?: FetchQueryOptions<
      Result['data'],
      ApiError<Params, Result> | unknown,
      Result,
      readonly [string, Params]
    >
  ): Promise<Result['data']> => {
    return await queryClient.fetchQuery<
      Result['data'],
      ApiError<Params, Result> | unknown,
      Result,
      readonly [string, Params]
    >(
      [`${fetcherMeta.method} ${fetcherMeta.route}`, params],
      async () => wrappedUserFetch({ ...fetcherMeta, data: params }),
      options
    )
  }

  const useQuery = <Params extends HandlerParams, Result extends HandlerResult>(
    fetcherMeta: FetcherMeta<Params, Result>,
    params: Params,
    options?: UseQueryOptions<
      Result['data'],
      ApiError<Params, Result> | unknown,
      Result,
      readonly [string, Params]
    >
  ) => {
    const { data, ...others } = useReactQuery<
      Result['data'],
      ApiError<Params, Result> | unknown,
      Result['data'],
      readonly [string, Params]
    >(
      [`${fetcherMeta.method} ${fetcherMeta.route}`, params] as const,
      async () => wrappedUserFetch({ ...fetcherMeta, data: params }),
      options
    )
    return [data, others] as const
  }

  const useMutation = <
    Params extends HandlerParams,
    Result extends HandlerResult
  >(
    fetcherMeta: FetcherMeta<Params, Result>,
    options?: UseMutationOptions<
      Result['data'],
      ApiError<Params, Result> | unknown,
      Params,
      readonly [string]
    >
  ) => {
    const { mutateAsync, ...others } = useReactMutation<
      Result['data'],
      ApiError<Params, Result> | unknown,
      Params,
      readonly [string]
    >(
      [`${fetcherMeta.method} ${fetcherMeta.route}`] as const,
      async (params: Params) => {
        return wrappedUserFetch({ ...fetcherMeta, data: params })
      },
      options
    )
    return [mutateAsync, others] as const
  }

  /**
   * A wrapper for your getServerSideProps func to be able to prefetch queries in ssr
   * Will automatically create a new query client for each request & add the dehydrated props
   * @param func Your getServerSideProps func which will get `prefetch` in first param
   */
  const gSSP = <
    P extends { [key: string]: any } = { [key: string]: any },
    Q extends ParsedUrlQuery = ParsedUrlQuery,
    D extends PreviewData = PreviewData
  >(
    func: (
      context: GetServerSidePropsContext<Q, D> & {
        prefetch: <Params extends HandlerParams, Result extends HandlerResult>(
          fetcherMeta: FetcherMeta<Params, Result>,
          params: Params
        ) => Promise<Result['data']>
      }
    ) => Promise<GetServerSidePropsResult<P>>
  ): GetServerSideProps<P, Q, D> => {
    // a separate query client for each request
    let queryClient: QueryClient | null = null

    /**
     * Function to prefetch data during ssr
     */
    const prefetch = async <
      Params extends HandlerParams,
      Result extends HandlerResult
    >(
      fetcherMeta: FetcherMeta<Params, Result>,
      params: Params
    ): Promise<Result['data']> => {
      // only create query client on first prefetch
      if (!queryClient) queryClient = new QueryClient(queryClientConfig)
      // call the handler directly with params in ssr
      const { status, data } = await fetcherMeta.handler(params)

      if (status < 200 || status > 299) {
        throw new ApiError('Api error occurred', params, data)
      }

      // add data to query client
      queryClient.prefetchQuery(
        [`${fetcherMeta.method} ${fetcherMeta.route}`, params] as const,
        async () => data
      )

      return data
    }

    // return a new getServerSideProps fn which wraps
    return async (context) => {
      const returnVal = await func({ ...context, prefetch })
      Object.assign(returnVal, {
        props: {
          queryClientState: queryClient ? dehydrate(queryClient) : undefined
        }
      })
      return returnVal
    }
  }

  /**
   * Provider for query client and hydrate
   */
  const Provider = ({
    pageProps,
    children
  }: {
    children: React.ReactNode
    pageProps: AppProps['pageProps']
  }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps?.queryClientState}>{children}</Hydrate>
      </QueryClientProvider>
    )
  }

  return {
    queryClient,
    fetcher,
    useQuery,
    useMutation,
    gSSP,
    Provider
  }
}
