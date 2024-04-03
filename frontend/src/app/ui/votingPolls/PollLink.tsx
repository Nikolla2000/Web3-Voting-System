'use client'

import { useSession } from "next-auth/react";
import Link from "next/link";
import { PollLinkProps } from "./pollsBoard";

export function PollLink({ id, children }: PollLinkProps) {
    const { data: session } = useSession();

    return (
        <Link href={
            `${!session || !session?.user 
            ? 'api/auth/signin' 
            : `/votingPolls/${id}`}`}>
                {children}
        </Link>
    )
}