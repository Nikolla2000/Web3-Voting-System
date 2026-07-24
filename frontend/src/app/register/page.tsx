import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { RegisterForm } from '@/components/auth/forms/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Join VoteChain to take part in on-chain elections."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/sign-in" className="font-medium text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}