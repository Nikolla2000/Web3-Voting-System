'use client';

import Link from 'next/link';
import { Menu } from '@base-ui/react/menu';
import { useAuthStore } from '@/lib/store/auth-store';
import type { AuthUser } from '@/lib/api/auth';
import { ProfileAvatarPreview } from '@/components/profile/ProfileAvatarPreview';

const menuItemClass =
  'flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors data-[highlighted]:bg-slate-50';

interface UserMenuProps {
  user: AuthUser;
}

export function UserMenu({ user }: UserMenuProps) {
  const logout = useAuthStore((state) => state.logout);

  return (
    <Menu.Root>
      <Menu.Trigger className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3.5 text-sm font-medium text-slate-700 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)] transition-colors hover:border-indigo-200 cursor-pointer">
        <ProfileAvatarPreview avatarUrl={user.avatar ?? undefined} username={user.username} size={28} />
        {user.username}
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner sideOffset={10} align="end" className="z-50">
          <Menu.Popup className="w-64 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-[0_20px_45px_-15px_rgba(15,23,42,0.25)]">
            <Menu.Item render={<Link href="/profile" />} className={menuItemClass}>
              Profile
            </Menu.Item>

            <Menu.Separator className="my-1 h-px bg-slate-100" />

            <Menu.Item onClick={() => logout()} className={`${menuItemClass} text-slate-500`}>
              Log out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
