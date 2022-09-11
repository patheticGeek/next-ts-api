import { QueryClientConfig } from '@tanstack/react-query'
import { NextApiHandler } from 'next'

export type HandlerParams = undefined | Record<string, any>
export type HandlerResult = { status: number; data: any }

export type Handler<
  Params extends HandlerParams = undefined,
  Result extends HandlerResult = { status: number; data: undefined }
> = (params: Params) => Promise<Result>

export type FetcherMeta<
  Params extends HandlerParams,
  Result extends HandlerResult
> = {
  /**
   * THIS WILL ONLY BE DEFINED IN SSR
   */
  handler: Handler<Params, Result>

  route: string
  method: string
}

export type ApiHandler<
  Params extends HandlerParams,
  Result extends HandlerResult
> = NextApiHandler<Result> & {
  fetcherMeta: FetcherMeta<Params, Result>
}

export type CreateClientsParams = {
  queryClient?: QueryClientConfig
  fetcher?: (params: FetcherParams) => Promise<any>
}

export type FetcherParams = { route: string; method: string; body: string }
