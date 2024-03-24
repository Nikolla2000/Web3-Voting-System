import LoginForm from "../ui/login/login-form";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login',
  };

export default function Page() {
    return (
        <main className="p-20 flex flex-col items-center lg:h-screen justify-center">
            <h1 className="text-center text-7xl font-bold text-blue-700 mb-10">Login</h1>
            <LoginForm/>
        </main>
    )
}