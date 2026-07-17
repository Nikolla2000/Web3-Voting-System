'use client'

import Link from "next/link"
import { ReactNode } from "react"
import { Button } from "react-bootstrap"
import toast from "react-hot-toast"

export default function StatisicsButton({ children } : {children: ReactNode}) {
    const handleClick = () => {
        toast.error('Statistics page is in development');
    }
    return (
        <div className="text-center mb-5" onClick={handleClick}>
            <Button variant="success">
                {/* <Link 
                    // href={`/votingPolls/${id}/statistics`}
                    className="text-white no-underline">
                    {children}
                </Link> */}
                <span className="text-white no-underline">
                    {children}
                </span>
            </Button>
        </div>
    )
}