'use client';

import { useState } from 'react';

interface ProfileAvatarPreviewProps {
  avatarUrl?: string;
  username: string;
  size?: number;
  className?: string;
}

export function ProfileAvatarPreview({ avatarUrl, username, size = 64, className = '' }: ProfileAvatarPreviewProps) {
  const [failedToLoad, setFailedToLoad] = useState(false);
  const initials = username.slice(0, 2).toUpperCase();
  const style = { width: size, height: size };

  if (avatarUrl && !failedToLoad) {
    return (
      <img
        src={avatarUrl}
        alt={`${username}'s avatar`}
        onError={() => setFailedToLoad(true)}
        style={style}
        className={`shrink-0 rounded-full border border-slate-200 object-cover ${className}`}
      />
    );
  }

  return (
    <span
      style={{ ...style, fontSize: size * 0.32 }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 font-semibold text-white ${className}`}
    >
      {initials}
    </span>
  );
}
