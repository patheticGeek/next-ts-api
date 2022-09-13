### Goal

As nextjs doesn't have a built in way to easily type check api routes and react query needs a lot of manual work, and trpc needs boilerplate and is somewhat slow and next-swr-endpoints not having ssr capabilities or fetching outside react and all these pass data in not a good way if you want others to be able to call your api. I wanted something which is just a function call and gives you hooks, prefetch etc. and have a simple way others can call your api too.

### Usage

1. Add in `next.config.js`

   ```js
   const { withNextSuper } = require('next-super-api')

   module.exports = withNextSuper({})
   ```

2. Create `src/utils/api.tsx`

   ```tsx
   import { createClients } from 'next-super-api/client'

   export const {
     useQuery,
     useMutation,
     fetcher,
     gSSP,
     queryClient,
     Provider: ApiProvider
   } = createClients({
     queryClient: {
       defaultOptions: {
         queries: {
           refetchOnWindowFocus: false
         }
       }
     }
   })
   ```

3. In your `_app.tsx` file setup the provider for react query and fetch using

   ```ts
   import { AppProps } from 'next/app'
   import { ApiProvider } from 'src/utils/api.ts'

   export default function App({ Component, pageProps }: AppProps) {
     return (
       <ApiProvider pageProps={pageProps}>
         <Component {...pageProps} />
       </ApiProvider>
     )
   }
   ```

   This will handle hydrating react query too

4. In your api route lets say `/api/user.ts`, setup using `createApi`

   ```ts
   import { writeFileSync } from 'fs'
   import { createApi } from 'next-super-api'

   const userApi = createApi(
     async ({ type, req }, params: { test: string }) => {
       if (type === 'client') {
         // api called from client
       } else if (type === 'server') {
         // api called in ssr
       }
       // always available :)
       const { headers, cookies } = req
       // server stuff, but this file can still be imported in client
       writeFileSync('./test.txt', 'data')
       // this status is set as status on the resp
       return { status: 200, data: { test: params.test } }
     }
   )

   export const getUser = userApi.fetcherMeta

   export default userApi
   ```

5. Use the hooks in any page! Lets say `index.tsx`

   ```tsx
   import { useEffect } from 'react'
   import { fetcher, gSSP, useQuery } from 'src/utils/api'
   import { getUser } from './api/user'

   export default function Web() {
     // call in react
     const [data, { refetch, isFetching }] = useQuery(getUser, {
       test: 'hello'
     })

     useEffect(() => {
       // call outside react
       fetcher(getUser, { test: 'hello' }).then(console.log)
     }, [])

     return (
       <div>
         <h2>Query</h2>
         <p>{JSON.stringify({ isLoading, data })}</p>
         <button onClick={() => refetch()}>Refetch</button>
       </div>
     )
   }

   export const getServerSideProps = gSSP(async ({ prefetch }) => {
     // call in ssr
     const data = await prefetch(getUser, { test: 'hello' })
     // gSSP will automatically add the query client state
     return { props: {} }
   })
   ```
