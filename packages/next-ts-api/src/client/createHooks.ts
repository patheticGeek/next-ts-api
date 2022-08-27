import { useFetcher } from "./fetcher"
import {useQuery as useReactQuery, useMutation as useReactMutation} from '@tanstack/react-query'

export const createHooks = (route: string, queries: string[], mutations: string[]) => {
  const hooks: Record<string, Function> = {}

  for (const queryKey of queries) {
    const useQuery = (data: any, options: any) => {
      const fetcher = useFetcher()
      return useReactQuery(
        [queryKey, data],
        async () => fetcher(route, 'query', queryKey, data),
        options
      )
    }
    hooks[queryKey] = useQuery
  }

  for (const mutationKey of mutations) {
    const useMutation = (options: any) => {
      const fetcher = useFetcher()
      return useReactMutation(
        [mutationKey],
        async (data) => fetcher(route, 'mutation', mutationKey, data),
        options
      )
    }
    hooks[mutationKey] = useMutation
  }

  return hooks
}
