import { GetServerSidePropsContext, NextApiRequest } from 'next'

import {
  GSSPContext,
  UseTypedMutation,
  UseTypedQuery
} from './client/react-query'

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
export type ContextFn<ContextFnResult = any> =
  | undefined
  | ((params: ContextFnParams) => ContextFnResult | Promise<ContextFnResult>)

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

type QueryHookKey<Key extends any> = Key extends string
  ? `use${Capitalize<Key>}Query`
  : Key
type MutationHookKey<Key extends any> = Key extends string
  ? `use${Capitalize<Key>}Mutation`
  : Key
type NewQueryKey<Key extends any> = Key extends string ? `${Key}Query` : Key
type NewMutationKey<Key extends any> = Key extends string
  ? `${Key}Mutation`
  : Key

type Hooks<
  SliceContextFnResult extends any | undefined,
  SliceQueries extends Queries<SliceContextFnResult>,
  SliceMutations extends Mutations<SliceContextFnResult>
> = {
  [QueryKey in keyof SliceQueries as QueryHookKey<QueryKey>]: SliceQueries[QueryKey] extends Resolver<
    SliceContextFnResult,
    infer Data,
    infer Result
  >
    ? UseTypedQuery<Data, Result>
    : undefined
} & {
  [MutationKey in keyof SliceMutations as MutationHookKey<MutationKey>]: SliceMutations[MutationKey] extends Resolver<
    SliceContextFnResult,
    infer Data,
    infer Result
  >
    ? UseTypedMutation<Data, Result>
    : undefined
}

type ReturnedQueries<
  SliceContextFnResult extends any | undefined,
  SliceQueries extends Queries<SliceContextFnResult>
> = {
  [QueryKey in keyof SliceQueries as NewQueryKey<QueryKey>]: SliceQueries[QueryKey] extends Resolver<
    SliceContextFnResult,
    infer Data,
    infer Result
  >
    ? (
        ctx: Pick<GSSPContext, 'req' | 'queryClient'>,
        data: Data
      ) => Promise<Result>
    : undefined
}

type ReturnedMutations<
  SliceContextFnResult extends any | undefined,
  SliceMutations extends Mutations<SliceContextFnResult>
> = {
  [MutationKey in keyof SliceMutations as NewMutationKey<MutationKey>]: SliceMutations[MutationKey] extends Resolver<
    SliceContextFnResult,
    infer Data,
    infer Result
  >
    ? (
        ctx: Pick<GSSPContext, 'req' | 'queryClient'>,
        data: Data
      ) => Promise<Result>
    : undefined
}

/**
 * Create slice return type
 */
export type ApiSlice<
  SliceContextFnResult extends any | undefined,
  SliceQueries extends Queries<SliceContextFnResult>,
  SliceMutations extends Mutations<SliceContextFnResult>
> = {
  client: Hooks<SliceContextFnResult, SliceQueries, SliceMutations>
  server: ReturnedQueries<SliceContextFnResult, SliceQueries> &
    ReturnedMutations<SliceContextFnResult, SliceMutations>
}

/**
 * Dummy function for types
 */
export const createApi = <
  SliceContextFnResult extends any | undefined,
  SliceQueries extends Queries<SliceContextFnResult>,
  SliceMutations extends Mutations<SliceContextFnResult>
>(
  _options: CreateApiSliceOptions<
    SliceContextFnResult,
    SliceQueries,
    SliceMutations
  >
): ApiSlice<SliceContextFnResult, SliceQueries, SliceMutations> => {
  throw new Error('This code path should not be reachable')
}
