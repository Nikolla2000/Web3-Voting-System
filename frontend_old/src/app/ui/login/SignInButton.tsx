'use client'

import { useSession } from "next-auth/react";
import Link from "next/link";
import loginStyles from './loginStyles.module.css';

export default function SignInButton () {
  const { data: session } = useSession();

  if(session && session.user )

  return (
    <Link href="/api/auth/signout" title='Get quote now'
      className={`${loginStyles.loginBtn} w-48 relative inline-flex items-center justify-center px-6 py-2 text-lg font-bold text-white transition-all duration-200 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 no-underline`}
      // style={loginBackground}
      role="button">Log Out     
    </Link>
  )


  return (
    <Link href={"api/auth/signin"}title='Get quote now'
    className={`${loginStyles.loginBtn} w-48 relative inline-flex items-center justify-center px-6 py-2 text-lg font-bold text-white transition-all duration-200 font-pj rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 no-underline`}
    // style={loginBackground}
    role="button">Log In to Vote    
  </Link>
  )
}