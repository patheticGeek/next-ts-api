import { NextApiHandler } from 'next'

// export type HandlerContext = {  }
export type HandlerParams = undefined | Record<string, any>
export type HandlerResult = { status: number; data: any }

export type Handler<
  Params extends HandlerParams = undefined,
  Result extends HandlerResult = { status: number; data: undefined }
> = (params: Params) => Promise<Result>

export type ApiFetcher<
  Params extends HandlerParams,
  Result extends HandlerResult
> = {
  (params: Params): Promise<Result>
  _routePath: string
}

export type ApiHandler<
  Params extends HandlerParams,
  Result extends HandlerResult
> = NextApiHandler<Result> & {
  fetcher: ApiFetcher<Params, Result>
}
