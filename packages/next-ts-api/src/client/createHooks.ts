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
    const capitalize = queryKey.slice(0,1).toUpperCase() + queryKey.slice(1)
    const key = `use${capitalize}Query`
    hooks[key] = useQuery
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
    const capitalize = mutationKey.slice(0,1).toUpperCase() + mutationKey.slice(1)
    const key = `use${capitalize}Mutation`
    hooks[key] = useMutation
  }

  return hooks
}
