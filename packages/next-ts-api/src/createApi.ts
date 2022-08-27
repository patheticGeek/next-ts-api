import { GetServerSidePropsContext, NextApiRequest } from 'next'

import { QueryClient } from '@tanstack/react-query'
import { UseTypedMutation, UseTypedQuery } from './client/react-query'

/**
 * Resolver function
 */
export type Resolver<Context = any, Params = any, Result = any> = (
  context: Context,
  params: Params
) => Promise<Result>

/**
 * Context function parameters
 */
export type ContextFnParams =
  | { type: 'server'; req: GetServerSidePropsContext['req'] }
  | { type: 'client'; req: NextApiRequest }

/**
 * Context function
 */
export type ContextFn<Context = any> =
  | undefined
  | ((params: ContextFnParams) => Context | Promise<Context>)

/**
 * Queries & mutations object
 */

export type Queries<SliceContextFn> = Record<string, Resolver<SliceContextFn>>

export type Mutations<SliceContextFn> = Record<string, Resolver<SliceContextFn>>

/**
 * Create slice options
 */
export type CreateApiSliceOptions<
  SliceContextFnResult extends any | undefined,
  SliceQueries extends Queries<SliceContextFnResult>,
  SliceMutations extends Mutations<SliceContextFnResult>
> = {
  /**
   * A context function which will be run for every request
   * and the result is passed to queries/mutations
   */
  getContext?: ContextFn<SliceContextFnResult>
  /**
   * The queries
   */
  queries: SliceQueries
  /**
   * The mutations
   */
  mutations: SliceMutations
}

type Hooks<
  SliceContextFnResult extends any | undefined,
  SliceQueries extends Queries<SliceContextFnResult>,
  SliceMutations extends Mutations<SliceContextFnResult>
> = {
  [Query in keyof SliceQueries]: 
    SliceQueries[Query] extends Resolver<SliceContextFnResult, infer Data, infer Result>
      ? UseTypedQuery<Data, Result>
      : undefined
} & {
  [Mutation in keyof SliceMutations]: 
    SliceMutations[Mutation] extends Resolver<SliceContextFnResult, infer Data, infer Result>
      ? UseTypedMutation<Data, Result>
      : undefined
}

type ReturnedQueries<
  SliceContextFnResult extends any | undefined,
  SliceQueries extends Queries<SliceContextFnResult>,
> = {
  [Query in keyof SliceQueries]: 
    SliceQueries[Query] extends Resolver<SliceContextFnResult, infer Data, infer Result>
      ? (req: GetServerSidePropsContext['req'], client: QueryClient, data: Data) => Result
      : undefined
}

type ReturnedMutations<
  SliceContextFnResult extends any | undefined,
  SliceMutations extends Mutations<SliceContextFnResult>
> = {
  [Mutation in keyof SliceMutations]: 
    SliceMutations[Mutation] extends Resolver<SliceContextFnResult, infer Data, infer Result>
      ? (req: GetServerSidePropsContext['req'], data: Data) => Result
      : undefined
}

/**
 * Create slice return type
 */
export type ApiSlice<
  SliceContextFnResult extends any | undefined,
  SliceQueries extends Queries<SliceContextFnResult>,
  SliceMutations extends Mutations<SliceContextFnResult>
> = Hooks<SliceContextFnResult, SliceQueries, SliceMutations>
// TODO
// [
//   Hooks<SliceContextFnResult, SliceQueries, SliceMutations>,
//   ReturnedQueries<SliceContextFnResult, SliceQueries>,
//   ReturnedMutations<SliceContextFnResult, SliceMutations>
// ]

/**
 * Dummy function for types
 */
export const createApi = <
  SliceContextFnResult extends any | undefined,
  SliceQueries extends Queries<SliceContextFnResult>,
  SliceMutations extends Mutations<SliceContextFnResult>
>(
  _options: CreateApiSliceOptions<SliceContextFnResult, SliceQueries, SliceMutations>
): ApiSlice<SliceContextFnResult, SliceQueries, SliceMutations> => {
  throw new Error('This code path should not be reachable')
}
