'use client'

import { fetchHasUserVoted } from "@/app/lib/data";
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react";

export default function HasVoted(pollId: any) {
  const { data: session } = useSession();
  const [hasVoted, setHasVoted] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHasVoted = async () => {
      if(session?.user.id) {
        const result = await fetchHasUserVoted(session.user.id, pollId.pollId);
        setHasVoted(result);
      }
    }

    checkHasVoted();;
  },[session?.user.id, pollId])
  
  if (hasVoted === null) {
    return null;
  }

  return hasVoted ? (
    <div className="text-red-500 text-center font-bold mb-2 text-lg">
      You've already voted for this poll
    </div>
  ) : null;
}