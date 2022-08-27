import { useUser } from "./api/test.rq";

export default function Web() {
  const { data, isLoading, refetch } = useUser.get({name: 'geek'})
  const { mutate } = useUser.create()

  return (
    <div>
      <h1>TESTING</h1>
      <p>loading: {isLoading ? 'true' : 'false'}, greeting: {data?.greeting}</p>
      <button onClick={() => refetch()}>Refetch</button>
      <button onClick={() => mutate({ name: 'jeep' })}>Refetch</button>
    </div>
  );
}
