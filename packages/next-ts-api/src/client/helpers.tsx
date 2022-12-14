import {
  Hydrate,
  QueryClient,
  QueryClientProvider
} from '@tanstack/react-query'
import { AppProps } from 'next/app'
import React from 'react'
import { Fetcher, FetcherProvider } from './fetcher'

/**
 * Wrapper to be used in `_app.tsx` file. Provides query client, hydrate & fetcher.
 * ```ts
    const queryClient = useCreateQueryClient()
    return (
      <NextTsApiProvider queryClient={queryClient} pageProps={pageProps}>
        {children}
      </NextTsApiProvider>
    )
 * ```
 */
export const NextTsApiProvider = ({
  children,
  fetcher,
  queryClient,
  pageProps
}: {
  children: React.ReactNode
  queryClient: QueryClient
  pageProps: AppProps['pageProps']
  fetcher?: Fetcher
}) => {
  return (
    <FetcherProvider fetcher={fetcher}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps?.queryClientState}>{children}</Hydrate>
      </QueryClientProvider>
    </FetcherProvider>
  )
}
