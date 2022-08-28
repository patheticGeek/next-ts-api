import React, { createContext, useContext } from 'react'

export type Fetcher = (route: string, type: 'query' | 'mutation', action: string, data: any) => Promise<any>

export type CustomFetcherOptions = Omit<RequestInit, 'method' | 'body'> | ((route: string, action: string, data: any) => Omit<RequestInit, 'method' | 'body'>)

/**
 * Create a fetcher from `fetch` by passing custom options
 * Could be useful for adding credentials etc.
 *
 * ```ts
 * // Pass in an object
 * const fetcher = createFetcher({ credentials: 'include' })
 * // Or it can be a function too
 * const fetcher = createFetcher((route, type, action, data) => {
 *  if (route === '/api/users') {
 *    return { headers: { 'token': localStorage.get('token') } }
 *  }
 *  return {}
 * })
 * ```
 */
export const createFetcher = (fetchOptions: CustomFetcherOptions) => {
  const fetcher: Fetcher = async (
    route: string,
    type: 'query' | 'mutation',
    action: string,
    data: any
  ) => {
    const customOptions =
      typeof fetchOptions === 'function'
        ? fetchOptions(route, action, data)
        : fetchOptions

    const options: RequestInit = {
      ...customOptions,
      method: 'POST',
      headers: {
        'Content-Type': ' application/json',
        ...(customOptions.headers || {})
      }
    }

    const params = new URLSearchParams({
      action,
      type
    })

    const body = JSON.stringify(data)
    const result = await fetch(`${route}?${params.toString()}`, { body, ...options })
    return (await result.json())
  }

  return fetcher
}

const defaultFetcher = createFetcher({})

const FetcherContext = createContext<Fetcher>(defaultFetcher)

export const FetcherProvider = ({ children, fetcher = defaultFetcher }: { children: React.ReactNode; fetcher?: Fetcher }) => {
  return (
    <FetcherContext.Provider value={fetcher}>
      {children}
    </FetcherContext.Provider>
  )
}

export const useFetcher = () => {
  return useContext(FetcherContext)
}
