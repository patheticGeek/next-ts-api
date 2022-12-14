import { AppProps } from 'next/app'
import { useCreateQueryClient, NextTsApiProvider } from 'next-ts-api/client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function App({ Component, pageProps }: AppProps) {
  const queryClient = useCreateQueryClient()

  return (
    <NextTsApiProvider queryClient={queryClient} pageProps={pageProps}>
      <Component {...pageProps} />
      <ReactQueryDevtools initialIsOpen={false} />
    </NextTsApiProvider>
  )
}
