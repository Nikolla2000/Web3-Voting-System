import { CalendarClock } from 'lucide-react';
import type { UserProfile } from '@/types/user';
import { ProfileAvatarPreview } from '@/components/profile/ProfileAvatarPreview';

interface ProfileHeaderCardProps {
  profile: UserProfile;
}

const memberSinceFormat = new Intl.DateTimeFormat('en', { dateStyle: 'long' });

export function ProfileHeaderCard({ profile }: ProfileHeaderCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-100/70 bg-white/80 backdrop-blur-sm">
      <div
        aria-hidden="true"
        className="h-24 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 sm:h-28"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-14 -top-14 h-48 w-48 rounded-full bg-violet-400/30 blur-3xl"
      />

      <div className="relative flex flex-col gap-4 px-6 pb-6 sm:px-8 sm:pb-8">
        <ProfileAvatarPreview
          avatarUrl={profile.avatar ?? undefined}
          username={profile.username}
          size={80}
          className="-mt-10 ring-4 ring-white sm:-mt-12"
        />

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold text-slate-900 sm:text-2xl">{profile.username}</h1>
            <p className="text-sm text-slate-500">{profile.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-indigo-100 bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-indigo-600">
              {profile.role === 'ADMIN' ? 'Administrator' : 'User'}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
              <CalendarClock className="h-3.5 w-3.5" />
              Since {memberSinceFormat.format(new Date(profile.createdAt))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
