import React, { createContext, useContext } from 'react'

type FetcherParams = {
  route: string
  type: 'query' | 'mutation'
  key: string
  data: any
  signal?: AbortSignal
}

export type Fetcher = (params: FetcherParams) => Promise<any>

export type CustomFetcherOptions =
  | Omit<RequestInit, 'method' | 'body'>
  | ((
      params: Omit<FetcherParams, 'signal'>
    ) => Omit<RequestInit, 'method' | 'body'>)

/**
 * Create a fetcher from `fetch` by passing custom options
 * Could be useful for adding credentials etc.
 *
 * ```ts
 * // Pass in an object
 * const fetcher = createFetcher({ credentials: 'include' })
 * // Or it can be a function too
 * const fetcher = createFetcher((route, type, key, data) => {
 *  if (route === '/api/users') {
 *    return { headers: { 'token': localStorage.get('token') } }
 *  }
 *  return {}
 * })
 * ```
 */
export const createFetcher = (fetchOptions: CustomFetcherOptions) => {
  const fetcher: Fetcher = async (params) => {
    const { route, type, key, data, signal } = params

    const customOptions =
      typeof fetchOptions === 'function'
        ? fetchOptions({ route, key, data, type })
        : fetchOptions

    const options: RequestInit = {
      ...customOptions,
      method: 'POST',
      headers: {
        'Content-Type': ' application/json',
        ...(customOptions.headers || {})
      }
    }

    const urlParams = new URLSearchParams({
      key,
      type
    })

    const body = JSON.stringify({ data })
    const result = await fetch(`${route}?${urlParams.toString()}`, {
      body,
      ...options,
      signal
    })
    const parsed = await result.json()
    if (parsed.error) throw new Error(parsed.error)
    return parsed.result
  }

  return fetcher
}

const defaultFetcher = createFetcher({})

const FetcherContext = createContext<Fetcher>(defaultFetcher)

export const FetcherProvider = ({
  children,
  fetcher = defaultFetcher
}: {
  children: React.ReactNode
  fetcher?: Fetcher
}) => {
  return (
    <FetcherContext.Provider value={fetcher}>
      {children}
    </FetcherContext.Provider>
  )
}

export const useFetcher = () => {
  return useContext(FetcherContext)
}
