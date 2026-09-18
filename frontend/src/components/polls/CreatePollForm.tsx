'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPollSchema, MIN_POLL_END_LEAD_HOURS, type CreatePollFormValues } from '@/lib/validation/poll-schemas';
import { createPoll, type CreatePollPayload } from '@/lib/api/polls';
import { getApiErrorMessage } from '@/lib/api/errors';
import { POLL_CATEGORY_LABELS } from '@/lib/polls/utils';
import type { PollCategory } from '@/types/poll';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { PollOptionsField } from '@/components/polls/PollOptionsField';

const CATEGORY_OPTIONS = Object.entries(POLL_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

function toDatetimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function CreatePollForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [minEndsAt] = useState(() =>
    toDatetimeLocalValue(new Date(Date.now() + MIN_POLL_END_LEAD_HOURS * 60 * 60 * 1000)),
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePollFormValues>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      category: 'governance',
      options: [{ value: '' }, { value: '' }],
    },
  });

  const mutation = useMutation({
    mutationFn: (payload: CreatePollPayload) => createPoll(payload),
    onSuccess: (poll) => {
      queryClient.invalidateQueries({ queryKey: ['polls'] });
      router.push(`/polls/${poll.id}`);
    },
  });

  const onSubmit = (values: CreatePollFormValues) => {
    setSubmitError(null);

    const payload: CreatePollPayload = {
      title: values.title,
      description: values.description,
      imageUrl: values.imageUrl,
      category: values.category as PollCategory,
      startsAt: new Date(values.startsAt).toISOString(),
      endsAt: new Date(values.endsAt).toISOString(),
      options: values.options.map((option) => option.value),
    };

    mutation.mutate(payload, {
      onError: (error) => setSubmitError(getApiErrorMessage(error)),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <Input
        label="Title"
        placeholder="Adopt quadratic voting for treasury proposals"
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="Description"
        placeholder="Explain what this poll is about and why it matters…"
        error={errors.description?.message}
        {...register('description')}
      />

      <Input
        label="Image URL"
        type="url"
        placeholder="https://example.com/poll-cover.jpg"
        error={errors.imageUrl?.message}
        {...register('imageUrl')}
      />

      <Select
        label="Category"
        options={CATEGORY_OPTIONS}
        error={errors.category?.message}
        {...register('category')}
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input
          label="Starts at"
          type="datetime-local"
          error={errors.startsAt?.message}
          {...register('startsAt')}
        />
        <Input
          label="Ends at"
          type="datetime-local"
          min={minEndsAt}
          error={errors.endsAt?.message}
          {...register('endsAt')}
        />
      </div>

      <PollOptionsField control={control} errors={errors} register={register} />

      {submitError && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{submitError}</p>}

      <Button type="submit" variant="primary" className="mt-1 w-full" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating poll…' : 'Create poll'}
      </Button>
    </form>
  );
}
