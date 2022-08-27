import { userHooks } from "./api/test.rq";

export default function Web() {
  const { data, refetch, isFetching } = userHooks.useGetQuery({name: 'geek'})
  const { mutate, isLoading: isMutLoading, data: mutData } = userHooks.useCreateMutation()

  return (
    <div>
      <h1>TESTING</h1>
      <h2>Query</h2>
      <p>loading: {isFetching ? 'true' : 'false'}, greeting: {data?.greeting}</p>
      <button onClick={() => refetch()}>Refetch</button>
      <h2>Mutation</h2>
      <p>loading: {isMutLoading ? 'true' : 'false'}, greeting: {mutData?.greeting}</p>
      <button onClick={() => mutate({ name: 'jeep' })}>Refetch</button>
    </div>
  );
}
