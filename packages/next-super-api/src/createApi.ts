import { ApiError } from './ApiError'
import {
  ApiFetcher,
  ApiHandler,
  Handler,
  HandlerParams,
  HandlerResult
} from './types'

export const createApi = <
  Params extends HandlerParams,
  Result extends HandlerResult
>(
  handler: Handler<Params, Result>,
  _routePath?: string
): ApiHandler<Params, Result> => {
  const apiHandler: ApiHandler<Params, Result> = async (req, res) => {
    const params = JSON.parse(req.body).data as Params
    const result = await handler(params)
    res.status(result.status).send(result)
  }

  const fetcher: ApiFetcher<Params, Result> = async (params) => {
    const result = await handler(params)
    if (result.status < 200 || result.status > 299) {
      throw new ApiError('Api error occurred', params, result)
    }
    return result
  }
  fetcher._routePath = _routePath || 'api-handler'

  apiHandler.fetcher = fetcher

  return apiHandler
}
