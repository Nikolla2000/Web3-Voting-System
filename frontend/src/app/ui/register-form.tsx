'use client'

export default function RegisterForm() {
    return (
        <form action="">
            <label htmlFor="name" className="block text-center mb-2">Username</label>
            <input type="text" id="username" name="username" className="block mx-auto mb-4"/>

            <label htmlFor="name" className="block text-center mb-2">Password</label>
            <input type="password" id="password" name="password" className="block mx-auto mb-4"/>
        </form>
    )
}