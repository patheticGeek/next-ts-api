import { QueryClientConfig } from '@tanstack/react-query'
import { GetServerSidePropsContext, NextApiHandler, NextApiRequest } from 'next'

export type HandlerParams = undefined | Record<string, any>
export type HandlerResult = { status: number; data: any }

type NextContext =
  | { type: 'ssr'; req: GetServerSidePropsContext['req'] }
  | { type: 'client'; req: NextApiRequest }

export type Handler<
  Params extends HandlerParams = undefined,
  Result extends HandlerResult = { status: number; data: undefined }
> = (nextCtx: NextContext, params: Params) => Promise<Result>

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
