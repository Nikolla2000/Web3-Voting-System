import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/forms/LoginForm';
import { authHref, RETURN_TO_PARAM, safeReturnTo } from '@/lib/auth/return-to';

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const returnTo = safeReturnTo((await searchParams)[RETURN_TO_PARAM]);

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to cast your vote."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href={authHref('/register', returnTo)} className="font-medium text-indigo-600 hover:text-indigo-700">
            Register
          </Link>
        </>
      }
    >
      <LoginForm returnTo={returnTo} />
    </AuthShell>
  );
}
