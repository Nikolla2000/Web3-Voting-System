'use client'

export default function LoginForm() {
    return (
            <form action="">
                <label htmlFor="name">Username</label>
                <input type="text" id="username" name="username"/>

                <label htmlFor="name">Password</label>
                <input type="password" id="password" name="password"/>
            </form>
    )
}