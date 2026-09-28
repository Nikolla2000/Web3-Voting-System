import { PasswordSection } from '@/components/profile/PasswordSection';
import { SignOutEverywhereCard } from '@/components/profile/SignOutEverywhereCard';

interface SecuritySectionProps {
  hasPassword: boolean;
}

export function SecuritySection({ hasPassword }: SecuritySectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <PasswordSection hasPassword={hasPassword} />
      <SignOutEverywhereCard />
    </div>
  );
}
