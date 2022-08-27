import { AppProps } from "next/app";
import { useCreateQueryClient, NextTsApiProvider } from "next-ts-api/dist/client";

export default function App({ Component, pageProps }: AppProps) {
  const queryClient = useCreateQueryClient()
  
  return (
    <NextTsApiProvider queryClient={queryClient} pageProps={pageProps}>
      <Component {...pageProps} />
    </NextTsApiProvider>
  );
}
