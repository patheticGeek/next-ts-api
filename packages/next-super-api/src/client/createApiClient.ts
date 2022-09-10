import { ApiError } from '../ApiError'
import { ApiFetcher, HandlerParams, HandlerResult } from '../types'

export const createApiClient = <
  Params extends HandlerParams,
  Result extends HandlerResult
>(
  routePath: string
): { fetcher: ApiFetcher<Params, Result> } => {
  const fetcher: ApiFetcher<Params, Result> = async (params) => {
    const res = await fetch(routePath, {
      method: 'POST',
      body: JSON.stringify({ data: params })
    })
    const result = (await res.json()) as Result
    if (result.status < 200 || result.status > 299) {
      throw new ApiError('Api error occurred', params, result)
    }
    return result
  }
  fetcher._routePath = routePath

  return { fetcher }
}
