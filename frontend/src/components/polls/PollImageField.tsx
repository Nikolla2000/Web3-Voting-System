'use client';

import { useEffect, useRef, useState } from 'react';
import { Controller, type Control } from 'react-hook-form';
import { ImagePlus } from 'lucide-react';
import type { CreatePollFormValues } from '@/lib/validation/poll-schemas';
import { IMAGE_ALLOWED_TYPES } from '@/lib/validation/image-upload';

interface PollImageFieldProps {
  control: Control<CreatePollFormValues>;
  error?: string;
}

export function PollImageField({ control, error }: PollImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Revoke the object URL when the component unmounts or the preview changes
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <Controller
      name="image"
      control={control}
      render={({ field: { value, onChange } }) => (
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-sm font-medium text-slate-700">Cover image</label>

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`flex aspect-[21/9] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border bg-white transition-colors hover:border-indigo-300 ${
              error ? 'border-red-300' : 'border-slate-200'
            }`}
          >
            {value && previewUrl ? (
              <img src={previewUrl} alt="Cover preview" className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-sm text-slate-400">
                <ImagePlus className="h-5 w-5" />
                Click to choose an image
              </span>
            )}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_ALLOWED_TYPES.join(',')}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (!file) return;

              if (previewUrl) URL.revokeObjectURL(previewUrl);
              setPreviewUrl(URL.createObjectURL(file));
              onChange(file);
            }}
          />

          {error && <span className="text-xs text-red-500">{error}</span>}
        </div>
      )}
    />
  );
}
