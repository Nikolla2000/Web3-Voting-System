'use client'

import Link from "next/link"

export default function LoginForm() {
    return (
            <form action="" className="text-center">
                <label htmlFor="name" className="block text-center mb-2">Username</label>
                <input type="text" id="username" name="username" className="block mx-auto mb-7 border-b-2"/>

                <label htmlFor="name" className="block text-center mb-2">Password</label>
                <input type="password" id="password" name="password" className="block mx-auto mb-7 border-b-2"/>
                <button className='bg-blue-700 text-white font-bold px-8 py-3 mt-10 rounded-lg hover:bg-blue-500 transition-all duration-200'>
                    Login
                </button>
                <Link 
                    href='/register'
                    className="mt-2">
                    <p className="text-blue-700 text-center mt-7 text-md hover:font-bold transition-all duration-200">
                        You don't have an account? Click here to register!
                    </p>
                </Link>
            </form>
    )
}