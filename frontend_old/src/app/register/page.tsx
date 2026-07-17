import Link from "next/link";
import RegisterForm from "../ui/login/register-form";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Register',
};

export default function Page() {
    return (
        <main className="p-20 flex-col items-center min-h-screen justify-center">
            <h1 className="text-center text-7xl font-bold text-blue-700 mb-10">Register</h1>
            <RegisterForm/>
            <p className="text-blue-700 text-center mt-3 text-md transition-all duration-200">Have an Account?
                <Link
                    href='/api/auth/signin'
                    className="mt-2 ml-2 font-bold hover:underline">
                        Sign In Here
                </Link>
            </p>
        </main>
    )
}