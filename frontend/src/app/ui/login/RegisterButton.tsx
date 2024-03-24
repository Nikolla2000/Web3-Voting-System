"use client"

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function RegisterButton() {
  const { data: session } = useSession();

  if(!session || !session?.user)
  return (
    <Link 
      href='/register'
      className="mt-2">
      <p className="text-blue-700 text-center mt-2 text-md hover:font-bold transition-all duration-200 hover:underline">
          Or <span className='font-bold'>Register</span> from here
      </p>
    </Link>
  )
}