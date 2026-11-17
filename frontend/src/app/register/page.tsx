import Link from 'next/link';
import { AuthShell } from '@/components/auth/AuthShell';
import { RegisterForm } from '@/components/auth/forms/RegisterForm';
import { authHref, RETURN_TO_PARAM, safeReturnTo } from '@/lib/auth/return-to';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const returnTo = safeReturnTo((await searchParams)[RETURN_TO_PARAM]);

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join VoteChain to take part in on-chain elections."
      footer={
        <>
          Already have an account?{' '}
          <Link href={authHref('/sign-in', returnTo)} className="font-medium text-indigo-600 hover:text-indigo-700">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm returnTo={returnTo} />
    </AuthShell>
  );
}
