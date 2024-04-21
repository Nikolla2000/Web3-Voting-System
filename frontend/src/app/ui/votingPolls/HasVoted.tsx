'use client'

import { fetchHasUserVoted } from "@/app/lib/data";
import { useSession } from "next-auth/react"

export default async function HasVoted(pollId: any) {
  const { data: session } = useSession();
  
  if(session?.user.id) {
    const hasVoted = await fetchHasUserVoted(session.user.id, pollId)

    return (
      hasVoted && <div className="text-red-500">You've already voted for this poll</div>
    )
  } else {
    return null;
  }
}