import { fetchPollById } from "@/app/lib/data"

export default async function Statistics({ params } : {params: {id: string}}) {
  const id = params.id
  const poll = await fetchPollById(parseInt(id));
  return (
    <div>Statistics of the poll {poll.id}...</div>
  )
}