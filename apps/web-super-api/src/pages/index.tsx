import { GetServerSideProps } from 'next';
import { useQuery } from 'next-super-api/client'
import { getUser } from "./api/test";

export default function Web() {
  const [data, { refetch, isFetching }] = useQuery(getUser, { test: 'hello' })

  return (
    <div>
      <h1>Testing</h1>
      <h2>Query</h2>
      <p>loading: {String(isFetching)}, greeting: {data?.test}</p>
      <button onClick={() => refetch()}>Refetch</button>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  return { props: {} }
}
