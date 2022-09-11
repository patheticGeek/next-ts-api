import { useEffect } from 'react'
import { fetcher, gSSP, useQuery } from 'src/utils/api'
import { getUser } from './api/test'

export default function Web() {
  // call in react
  const [data, { refetch, isFetching }] = useQuery(getUser, { test: 'hello' })

  useEffect(() => {
    // call outside react
    fetcher(getUser, { test: 'hello' }).then(console.log)
  }, [])

  return (
    <div>
      <h1>Testing</h1>
      <h2>Query</h2>
      <p>
        loading: {String(isFetching)}, greeting: {data?.test}
      </p>
      <button onClick={() => refetch()}>Refetch</button>
    </div>
  )
}

export const getServerSideProps = gSSP(async ({ prefetch }) => {
  // call in ssr
  const data = await prefetch(getUser, { test: 'hello' })

  console.log(`SSR data:`, data)

  return { props: {} }
})
