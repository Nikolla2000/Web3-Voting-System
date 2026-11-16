import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { CreatePollForm } from '@/components/polls/CreatePollForm';
import { checkDuplicatePoll, checkPollNeutrality } from '@/lib/api/ai';
import { createPoll, uploadPollImage } from '@/lib/api/polls';
import type { Poll } from '@/types/poll';
import { deferred } from '@/test/axios-adapter';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/lib/api/polls', () => ({ createPoll: vi.fn(), uploadPollImage: vi.fn() }));
vi.mock('@/lib/api/ai', () => ({ checkDuplicatePoll: vi.fn(), checkPollNeutrality: vi.fn() }));

const HOUR = 60 * 60 * 1000;

/** The same `YYYY-MM-DDTHH:mm` local-time format a datetime-local input produces. */
function datetimeLocal(offsetMs: number): string {
  const d = new Date(Date.now() + offsetMs);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STARTS_AT = datetimeLocal(HOUR);
const ENDS_AT = datetimeLocal(72 * HOUR);
const cover = new File([new Uint8Array(2048)], 'cover.png', { type: 'image/png' });
const createdPoll = { id: 'poll-123' } as Poll;

function apiError(status: number, message: string) {
  const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;
  return new AxiosError('failed', 'ERR_BAD_REQUEST', config, null, {
    status,
    statusText: '',
    data: { message },
    headers: {},
    config,
  });
}

function setup({ applyAccept = true } = {}) {
  // delay: null skips the per-keystroke timer; typing still fires every key event.
  const user = userEvent.setup({ applyAccept, delay: null });
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  render(<CreatePollForm />, { wrapper });

  // "Cover image" labels both the hidden file input and the visible picker button.
  const fileInput = screen.getByLabelText<HTMLInputElement>('Cover image', { selector: 'input' });

  const fillValid = async (overrides: { options?: string[]; file?: File } = {}) => {
    await user.type(screen.getByLabelText('Title'), 'Best city for a weekend trip?');
    await user.type(screen.getByLabelText('Description'), 'Pick the city you would most like to visit.');
    await user.upload(fileInput, overrides.file ?? cover);
    await user.selectOptions(screen.getByLabelText('Category'), 'travel');
    // datetime-local can't be typed into reliably under jsdom; set its value as the browser would.
    fireEvent.change(screen.getByLabelText('Starts at'), { target: { value: STARTS_AT } });
    fireEvent.change(screen.getByLabelText('Ends at'), { target: { value: ENDS_AT } });
    const options = overrides.options ?? ['Lisbon', 'Prague'];
    for (let i = 2; i < options.length; i++) {
      await user.click(screen.getByRole('button', { name: 'Add option' }));
    }
    for (const [i, value] of options.entries()) {
      await user.type(screen.getByLabelText(`Option ${i + 1}`), value);
    }
  };

  const submit = () => user.click(screen.getByRole('button', { name: 'Create poll' }));

  return { user, fillValid, submit, fileInput, invalidateSpy };
}

beforeEach(() => {
  // jsdom has no object-URL support; PollImageField uses it for the preview.
  Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:preview'), revokeObjectURL: vi.fn() });
  vi.mocked(checkDuplicatePoll).mockResolvedValue([]);
  vi.mocked(checkPollNeutrality).mockResolvedValue({ isNeutral: true, issues: [] });
  vi.mocked(uploadPollImage).mockResolvedValue({ url: 'https://cdn.example/cover.png' });
  vi.mocked(createPoll).mockResolvedValue(createdPoll);
});

afterEach(() => {
  Reflect.deleteProperty(URL, 'createObjectURL');
  Reflect.deleteProperty(URL, 'revokeObjectURL');
});

describe('CreatePollForm — validation', () => {
  it('shows every required-field error and makes no network calls when submitted empty', async () => {
    const { submit } = setup();

    await submit();

    expect(await screen.findByLabelText('Title')).toHaveAccessibleDescription('Title must be at least 5 characters');
    expect(screen.getByLabelText('Description')).toHaveAccessibleDescription(
      'Description must be at least 10 characters',
    );
    expect(screen.getByRole('button', { name: 'Cover image Click to choose an image' })).toHaveAccessibleDescription(
      'Please choose a cover image',
    );
    expect(screen.getByLabelText('Starts at')).toHaveAccessibleDescription('Start date is required');
    expect(screen.getByLabelText('Ends at')).toHaveAccessibleDescription('End date is required');
    for (const label of ['Option 1', 'Option 2']) {
      expect(screen.getByLabelText(label)).toBeInvalid();
      expect(screen.getByLabelText(label)).toHaveAccessibleDescription('Option text is required');
    }

    expect(checkDuplicatePoll).not.toHaveBeenCalled();
    expect(uploadPollImage).not.toHaveBeenCalled();
  });

  it('rejects a non-image file even if the browser’s accept filter is bypassed', async () => {
    const { fillValid, submit } = setup({ applyAccept: false });

    await fillValid({ file: new File(['GIF89a'], 'anim.gif', { type: 'image/gif' }) });
    await submit();

    expect(await screen.findByText('Please choose a JPG, PNG or WEBP image.')).toBeInTheDocument();
    expect(uploadPollImage).not.toHaveBeenCalled();
  });

  it('flags a repeated option on its own row and submits nothing', async () => {
    const { fillValid, submit } = setup();

    await fillValid({ options: ['Lisbon', 'Prague', 'lisbon'] });
    await submit();

    expect(await screen.findByLabelText('Option 3')).toHaveAccessibleDescription('Each option must be different');
    expect(screen.getByLabelText('Option 1')).not.toHaveAttribute('aria-invalid');
    expect(checkDuplicatePoll).not.toHaveBeenCalled();
    expect(createPoll).not.toHaveBeenCalled();
  });

  it('sends options trimmed, so padding never reaches the AI checks or the API', async () => {
    const { fillValid, submit } = setup();

    await fillValid({ options: ['  Lisbon', 'Prague  '] });
    await submit();

    await vi.waitFor(() => expect(createPoll).toHaveBeenCalled());
    expect(checkPollNeutrality).toHaveBeenCalledWith('Best city for a weekend trip?', ['Lisbon', 'Prague']);
    expect(vi.mocked(createPoll).mock.calls[0]![0].options).toEqual(['Lisbon', 'Prague']);
  });

  it('names the image picker by its preview once an image is chosen', async () => {
    const { user, fileInput } = setup();

    await user.upload(fileInput, cover);

    expect(screen.getByRole('button', { name: 'Cover image Cover preview' })).toBeInTheDocument();
  });

  it('lets options be added and removed, but never below two', async () => {
    const { user } = setup();
    const removeButtons = () => screen.getAllByRole('button', { name: /^Remove option/ });

    expect(removeButtons()).toHaveLength(2);
    for (const button of removeButtons()) expect(button).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Add option' }));
    expect(screen.getByLabelText('Option 3')).toBeInTheDocument();
    for (const button of removeButtons()) expect(button).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Remove option 3' }));
    expect(screen.queryByLabelText('Option 3')).not.toBeInTheDocument();
    for (const button of removeButtons()) expect(button).toBeDisabled();
  });
});

describe('CreatePollForm — submission', () => {
  it('runs both AI checks, uploads the image, creates the poll with the uploaded URL, then navigates to it', async () => {
    const { fillValid, submit, invalidateSpy } = setup();

    await fillValid({ options: ['Lisbon', 'Prague', 'Vienna'] });
    await submit();

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith('/polls/poll-123'));
    expect(checkDuplicatePoll).toHaveBeenCalledWith(
      'Best city for a weekend trip?',
      'Pick the city you would most like to visit.',
    );
    expect(checkPollNeutrality).toHaveBeenCalledWith('Best city for a weekend trip?', ['Lisbon', 'Prague', 'Vienna']);
    expect(uploadPollImage).toHaveBeenCalledWith(cover);
    expect(createPoll).toHaveBeenCalledWith({
      title: 'Best city for a weekend trip?',
      description: 'Pick the city you would most like to visit.',
      imageUrl: 'https://cdn.example/cover.png',
      category: 'travel',
      // datetime-local values are local wall-clock time; the API gets the matching UTC instant.
      startsAt: new Date(STARTS_AT).toISOString(),
      endsAt: new Date(ENDS_AT).toISOString(),
      options: ['Lisbon', 'Prague', 'Vienna'],
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['polls'] });
  });

  it('runs the two AI checks in parallel and locks the button while they run', async () => {
    const duplicate = deferred<[]>();
    const neutrality = deferred<{ isNeutral: boolean; issues: [] }>();
    vi.mocked(checkDuplicatePoll).mockReturnValue(duplicate.promise);
    vi.mocked(checkPollNeutrality).mockReturnValue(neutrality.promise);
    const { fillValid, submit } = setup();

    await fillValid();
    await submit();

    // Both started before either finished.
    expect(checkDuplicatePoll).toHaveBeenCalledOnce();
    expect(checkPollNeutrality).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Checking your poll…' })).toBeDisabled();
    expect(uploadPollImage).not.toHaveBeenCalled();

    duplicate.resolve([]);
    neutrality.resolve({ isNeutral: true, issues: [] });
    await vi.waitFor(() => expect(createPoll).toHaveBeenCalledOnce());
  });

  it('still creates the poll when both AI checks fail — they are advisory, not a gate', async () => {
    vi.mocked(checkDuplicatePoll).mockRejectedValue(new Error('ai-service down'));
    vi.mocked(checkPollNeutrality).mockRejectedValue(new Error('ai-service down'));
    const { fillValid, submit } = setup();

    await fillValid();
    await submit();

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith('/polls/poll-123'));
    expect(screen.queryByText(/Review this before creating your poll/)).not.toBeInTheDocument();
  });

  it('shows the server’s message when the image upload fails, without creating the poll', async () => {
    vi.mocked(uploadPollImage).mockRejectedValue(apiError(413, 'File too large'));
    const { fillValid, submit } = setup();

    await fillValid();
    await submit();

    expect(await screen.findByText('File too large')).toBeInTheDocument();
    expect(createPoll).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Create poll' })).toBeEnabled();
  });

  it('shows a rate-limit message when poll creation is throttled', async () => {
    const throttled = apiError(429, 'ThrottlerException');
    throttled.response!.headers = { 'retry-after': '20' };
    vi.mocked(createPoll).mockRejectedValue(throttled);
    const { fillValid, submit } = setup();

    await fillValid();
    await submit();

    expect(await screen.findByText('Too many requests — try again in 20s.')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});

describe('CreatePollForm — preflight warnings', () => {
  const warningsPanel = () => screen.getByText(/Review this before creating your poll/).closest('div')!.parentElement!;

  it('pauses on a likely duplicate, showing the match, and creates nothing yet', async () => {
    vi.mocked(checkDuplicatePoll).mockResolvedValue([
      { pollId: 'existing-1', title: 'Favourite weekend city?', similarity: 0.91 },
    ]);
    const { fillValid, submit } = setup();

    await fillValid();
    await submit();

    expect(await screen.findByText('This looks similar to an existing poll')).toBeInTheDocument();
    const match = screen.getByRole('link', { name: /Favourite weekend city\?/ });
    expect(match).toHaveAttribute('href', '/polls/existing-1');
    expect(within(match).getByText('91% similar')).toBeInTheDocument();
    expect(uploadPollImage).not.toHaveBeenCalled();
    expect(createPoll).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Create poll' })).not.toBeInTheDocument();
  });

  it('words the heading for several matches and lists each one', async () => {
    vi.mocked(checkDuplicatePoll).mockResolvedValue([
      { pollId: 'existing-1', title: 'Favourite weekend city?', similarity: 0.91 },
      { pollId: 'existing-2', title: 'Where to spend a weekend?', similarity: 0.87 },
    ]);
    const { fillValid, submit } = setup();

    await fillValid();
    await submit();

    expect(await screen.findByText('This looks similar to existing polls')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /% similar/ })).toHaveLength(2);
  });

  it('shows neutrality issues with their suggested rewrite', async () => {
    vi.mocked(checkPollNeutrality).mockResolvedValue({
      isNeutral: false,
      issues: [{ text: 'Best city', explanation: 'Presumes a single best answer', suggestion: 'Which city' }],
    });
    const { fillValid, submit } = setup();

    await fillValid();
    await submit();

    const panel = await vi.waitFor(() => warningsPanel());
    expect(within(panel).getByText('“Best city”')).toBeInTheDocument();
    expect(within(panel).getByText('Presumes a single best answer')).toBeInTheDocument();
    expect(within(panel).getByText('Which city')).toBeInTheDocument();
  });

  it('“Create anyway” submits exactly the values that were checked', async () => {
    vi.mocked(checkDuplicatePoll).mockResolvedValue([{ pollId: 'existing-1', title: 'Similar', similarity: 0.9 }]);
    const { user, fillValid, submit } = setup();

    await fillValid();
    await submit();
    await user.click(await screen.findByRole('button', { name: 'Create anyway' }));

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith('/polls/poll-123'));
    expect(createPoll).toHaveBeenCalledWith(expect.objectContaining({ title: 'Best city for a weekend trip?' }));
    expect(checkDuplicatePoll).toHaveBeenCalledOnce(); // not re-checked
  });

  it('“Edit my poll” dismisses the warnings and returns to the form without creating anything', async () => {
    vi.mocked(checkDuplicatePoll).mockResolvedValue([{ pollId: 'existing-1', title: 'Similar', similarity: 0.9 }]);
    const { user, fillValid, submit } = setup();

    await fillValid();
    await submit();
    await user.click(await screen.findByRole('button', { name: 'Edit my poll' }));

    expect(screen.queryByText(/Review this before creating your poll/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('Best city for a weekend trip?');
    expect(screen.getByRole('button', { name: 'Create poll' })).toBeEnabled();
    expect(createPoll).not.toHaveBeenCalled();
  });
});
