import {
  FetcherMeta,
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
  route?: string
): ApiHandler<Params, Result> => {
  const apiHandler: ApiHandler<Params, Result> = async (req, res) => {
    const params = JSON.parse(req.body).data
    const result = await handler(params)
    res.status(result.status).send(result)
  }

  const fetcherMeta: FetcherMeta<Params, Result> = {
    handler,
    route: route || 'api-route-build',
    method: 'POST'
  }

  apiHandler.fetcherMeta = fetcherMeta

  return apiHandler
}
