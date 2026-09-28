import { KeyRound } from 'lucide-react';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';
import { SetPasswordForm } from '@/components/profile/SetPasswordForm';
import { SectionCard } from '@/components/profile/SectionCard';

interface PasswordSectionProps {
  hasPassword: boolean;
}

export function PasswordSection({ hasPassword }: PasswordSectionProps) {
  return (
    <SectionCard
      eyebrow="Security"
      title={hasPassword ? 'Password' : 'Set a password'}
      description={
        hasPassword
          ? 'Update the password used to sign in with your email.'
          : 'Your account was created with Google sign-in and has no password yet. Set one to also be able to sign in with your email.'
      }
      icon={KeyRound}
    >
      {hasPassword ? <ChangePasswordForm /> : <SetPasswordForm />}
    </SectionCard>
  );
}
