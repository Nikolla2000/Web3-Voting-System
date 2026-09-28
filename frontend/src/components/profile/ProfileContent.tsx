'use client';

import { useState } from 'react';
import type { UserProfile } from '@/types/user';
import { ProfileHeaderCard } from '@/components/profile/ProfileHeaderCard';
import { ProfileNav, type ProfileSectionId } from '@/components/profile/ProfileNav';
import { ProfileInfoForm } from '@/components/profile/ProfileInfoForm';
import { SecuritySection } from '@/components/profile/SecuritySection';
import { DangerZoneSection } from '@/components/profile/DangerZoneSection';

interface ProfileContentProps {
  profile: UserProfile;
}

export function ProfileContent({ profile }: ProfileContentProps) {
  const [activeSection, setActiveSection] = useState<ProfileSectionId>('account');

  return (
    <div className="flex flex-col gap-6">
      <ProfileHeaderCard profile={profile} />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <ProfileNav active={activeSection} onChange={setActiveSection} />

        <div className="min-w-0 flex-1">
          {activeSection === 'account' && <ProfileInfoForm profile={profile} />}
          {activeSection === 'security' && <SecuritySection hasPassword={profile.hasPassword} />}
          {activeSection === 'danger' && <DangerZoneSection hasPassword={profile.hasPassword} />}
        </div>
      </div>
    </div>
  );
}
