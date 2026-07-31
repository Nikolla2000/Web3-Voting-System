'use client';

import Link from 'next/link';
import { Menu } from '@base-ui/react/menu';
import { useAuthStore } from '@/lib/store/auth-store';
import { useWallet, METAMASK_INSTALL_URL } from '@/lib/web3/use-wallet';
import type { AuthUser } from '@/lib/api/auth';

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

const menuItemClass =
  'flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none transition-colors data-[highlighted]:bg-slate-50';

interface UserMenuProps {
  user: AuthUser;
}

export function UserMenu({ user }: UserMenuProps) {
  const logout = useAuthStore((state) => state.logout);
  const { address, isConnected, disconnect, connectWallet, hasInjectedProvider } = useWallet();

  return (
    <Menu.Root>
      <Menu.Trigger className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3.5 text-sm font-medium text-slate-700 shadow-[0_2px_10px_-4px_rgba(15,23,42,0.08)] transition-colors hover:border-indigo-200">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-semibold text-white">
          {user.username.slice(0, 2).toUpperCase()}
        </span>
        {user.username}
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner sideOffset={10} align="end" className="z-50">
          <Menu.Popup className="w-64 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-[0_20px_45px_-15px_rgba(15,23,42,0.25)]">
            <Menu.Item render={<Link href="/profile" />} className={menuItemClass}>
              Profile
            </Menu.Item>

            <Menu.Separator className="my-1 h-px bg-slate-100" />

            {isConnected && address ? (
              <Menu.Item onClick={() => disconnect()} className={menuItemClass}>
                <span className="font-mono text-xs text-slate-500">
                  {truncateAddress(address)}
                </span>
                <span className="text-xs text-red-500">Disconnect</span>
              </Menu.Item>
            ) : hasInjectedProvider ? (
              <Menu.Item
                onClick={connectWallet}
                className={`${menuItemClass} text-indigo-600 data-[highlighted]:bg-indigo-50`}
              >
                Connect wallet
              </Menu.Item>
            ) : (
              <Menu.Item
                render={
                  <a href={METAMASK_INSTALL_URL} target="_blank" rel="noopener noreferrer" />
                }
                className={`${menuItemClass} text-indigo-600 data-[highlighted]:bg-indigo-50`}
              >
                Install MetaMask
              </Menu.Item>
            )}

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