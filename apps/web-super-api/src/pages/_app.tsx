import { AppProps } from 'next/app'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider } from 'src/utils/api'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider pageProps={pageProps}>
      <Component {...pageProps} />
      <ReactQueryDevtools />
    </Provider>
  )
}
