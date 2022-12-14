import { ApiHandler, FetcherMeta, HandlerParams, HandlerResult } from '../types'

export const createApiClient = <
  Params extends HandlerParams,
  Result extends HandlerResult
>(
  route: string,
  method: string
): Pick<ApiHandler<Params, Result>, 'fetcherMeta'> => {
  const fetcherMeta: FetcherMeta<Params, Result> = {
    handler: undefined as any,
    route,
    method
  }

  return { fetcherMeta }
}
