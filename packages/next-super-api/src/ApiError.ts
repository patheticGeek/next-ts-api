import { HandlerParams, HandlerResult } from "./types"

export class ApiError<Params extends HandlerParams, Result extends HandlerResult> extends Error {
  params: Params
  data: Result

  constructor(message: string, params: Params, data: Result) {
    super(message)
    this.params = params
    this.data = data
  }
}
