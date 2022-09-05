### Goal

As nextjs doesnt have a built in way to easily type check api routes and react query needs a lot of manual work, and trpc needs boilerplate and is somewhat slow and next-swr-endpoints not having ssr capabilities. I wanted something which is just a function call and gives you hooks, prefetch etc. and wanting it to be kinda simmillar to how graphql resolvers work, that lead me to making this.

### TLDR

This library lets you use a function `createApi` in the api routes, which returns an object with react query hooks.
You can directly import those hooks and use them in any page.

**How its done:** When next compiles your project, this uses webpack loaders to spit out the api file differently based on if its being loaded in client or if its being compiled as an api route.

### Usage

1. Add in `next.config.js`

   ```js
   const { withNextTsAPI } = require("next-ts-api");
   module.exports = withNextTsAPI({});
   ```

1. In your `_app.tsx` file setup the provider for react query and fetch using

   ```ts
   import { AppProps } from "next/app";
   import { useCreateQueryClient, NextTsApiProvider } from "next-ts-api/client";

   export default function App({ Component, pageProps }: AppProps) {
     const queryClient = useCreateQueryClient();

     return (
       <NextTsApiProvider queryClient={queryClient} pageProps={pageProps}>
         <Component {...pageProps} />
       </NextTsApiProvider>
     );
   }
   ```

   This will handle hydrating react query too

1. In your api route lets say `/api/user.rq.ts`, setup using `createApi`

   ```ts
   import { createApi } from "next-ts-api";

   const userApi = createApi({
     getContext: ({ req }) => ({ hello: "hello" }),
     queries: {
       getUser: async (ctx, params: { name: string }) => {
         return { greeting: `${ctx.hello}, ${params.name}` };
       }
     },
     mutations: {
       createUser: async (ctx, params: { name: string }) => {
         return { greeting: `${ctx.hello}, ${params.name}` };
       }
     }
   });

   // query named `getUser` will make hook named `useGetUserQuery`
   export const { useCreateUserMutation, useGetUserQuery } = userApi.client;
   // these are server side functions
   export const { createUserMutation, getUserQuery } = userApi.server;
   ```

   All api routes which you want hooks to be generated on should end with `.rq.ts`

1. Use the hooks in any page! Lets say `index.tsx`

   ```tsx
   import { gSSPWithQueryClient } from "next-ts-api/client";
   import {
     useCreateUserMutation,
     useGetUserQuery,
     getUserQuery
   } from "./api/test.rq";

   export default function Web() {
     const { data, refetch, isFetching } = useGetUserQuery({ name: "geek" });
     const {
       mutate,
       isLoading: isMutLoading,
       data: mutData
     } = useCreateUserMutation();

     return (
       <div>
         <h1>Testing</h1>
         <h2>Query</h2>
         <p>
           loading: {String(isFetching)}, greeting: {data?.greeting}
         </p>
         <button onClick={() => refetch()}>Refetch</button>
         <h2>Mutation</h2>
         <p>
           loading: {String(isMutLoading)}, greeting: {mutData?.greeting}
         </p>
         <button onClick={() => mutate({ name: "jeep" })}>Refetch</button>
       </div>
     );
   }

   export const getServerSideProps = gSSPWithQueryClient(
     async ({ req, queryClient }) => {
       await getUserQuery({ req, queryClient }, { name: "geek" });
       return { props: {} };
     }
   );
   ```
