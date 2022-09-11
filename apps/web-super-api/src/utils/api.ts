import { createClients } from 'next-super-api/client'

export const { useQuery, useMutation, fetcher, gSSP, queryClient, Provider } =
  createClients({
    queryClient: {
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false
        }
      }
    }
  })
