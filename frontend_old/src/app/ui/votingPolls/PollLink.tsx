'use client'

import { PollLinkProps } from "@/app/_types/types";
import { useSession } from "next-auth/react";
import Link from "next/link";

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