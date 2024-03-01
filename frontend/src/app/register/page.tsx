import RegisterForm from "../ui/register-form";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Register',
};

export default function Page() {
    return (
        <main className="p-20 flex-col items-center lg:h-screen justify-center">
            <h1 className="text-center text-7xl font-bold text-blue-700 mb-10">Register</h1>
            <RegisterForm/>
        </main>
    )
}