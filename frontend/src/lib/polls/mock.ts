import type { Poll } from '@/types/poll';

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function hoursFromNow(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

function mockAddress(seed: string): string {
  const hex = Array.from(seed)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('')
    .padEnd(40, '0')
    .slice(0, 40);
  return `0x${hex}`;
}

export const mockPolls: Poll[] = [
  {
    id: 'poll-quadratic-voting',
    title: 'Adopt quadratic voting for treasury proposals',
    description:
      'Move from one-token-one-vote to a quadratic model for treasury spending decisions, reducing the influence of large token holders on day-to-day proposals.',
    imageUrl: 'https://picsum.photos/seed/quadratic-voting/800/450',
    category: 'governance',
    startsAt: daysFromNow(-4),
    endsAt: daysFromNow(3),
    contractAddress: mockAddress('quadratic-voting'),
    options: [
      { id: 'opt-adopt', label: 'Adopt quadratic voting', votes: 1284 },
      { id: 'opt-keep', label: 'Keep current model', votes: 742 },
      { id: 'opt-abstain', label: 'Abstain', votes: 96 },
    ],
  },
  {
    id: 'poll-zk-rollup',
    title: 'Migrate settlement layer to a ZK-rollup',
    description:
      'Cut gas costs for voters by moving vote settlement from L1 to a ZK-rollup, with results anchored back to Sepolia every epoch.',
    imageUrl: 'https://picsum.photos/seed/zk-rollup/800/450',
    category: 'technical',
    startsAt: daysFromNow(-1),
    endsAt: hoursFromNow(6),
    contractAddress: mockAddress('zk-rollup'),
    options: [
      { id: 'opt-approve', label: 'Approve migration', votes: 958 },
      { id: 'opt-reject', label: 'Reject migration', votes: 311 },
    ],
  },
  {
    id: 'poll-q2-treasury',
    title: 'Q2 2026 community treasury allocation',
    description:
      'Decide how the 500,000 USDC treasury surplus from Q2 should be distributed across grants, growth, and security.',
    imageUrl: 'https://picsum.photos/seed/treasury-allocation/800/450',
    category: 'treasury',
    startsAt: daysFromNow(-12),
    endsAt: daysFromNow(-5),
    contractAddress: mockAddress('q2-treasury'),
    options: [
      { id: 'opt-grants', label: 'Fund developer grants program', votes: 2140 },
      { id: 'opt-marketing', label: 'Fund marketing & partnerships', votes: 1875 },
      { id: 'opt-audit', label: 'Fund security audit reserve', votes: 960 },
      { id: 'opt-return', label: 'Return to treasury', votes: 204 },
    ],
  },
  {
    id: 'poll-steering-committee',
    title: 'Elect the Q3 Technical Steering Committee',
    description:
      'Vote for up to one candidate to fill the open Technical Steering Committee seat for the upcoming quarter.',
    imageUrl: 'https://picsum.photos/seed/steering-committee/800/450',
    category: 'community',
    startsAt: daysFromNow(-2),
    endsAt: daysFromNow(9),
    contractAddress: mockAddress('steering-committee'),
    options: [
      { id: 'opt-alex', label: 'Alex Petrov', votes: 612 },
      { id: 'opt-maria', label: 'Maria Ivanova', votes: 588 },
      { id: 'opt-deniz', label: 'Deniz Yilmaz', votes: 401 },
      { id: 'opt-chen', label: 'Chen Wei', votes: 377 },
      { id: 'opt-sofia', label: 'Sofia Delgado', votes: 290 },
    ],
  },
  {
    id: 'poll-semaphore',
    title: 'Enable Semaphore-based anonymous voting',
    description:
      'Introduce an opt-in zero-knowledge voting mode using Semaphore, letting voters prove eligibility without revealing which wallet they voted from.',
    imageUrl: 'https://picsum.photos/seed/semaphore-zk/800/450',
    category: 'governance',
    startsAt: daysFromNow(2),
    endsAt: daysFromNow(11),
    contractAddress: mockAddress('semaphore'),
    options: [
      { id: 'opt-enable', label: 'Enable anonymous voting', votes: 0 },
      { id: 'opt-keep-public', label: 'Keep public wallet-linked votes', votes: 0 },
    ],
  },
  {
    id: 'poll-staking-rewards',
    title: 'Increase validator staking rewards by 1.5%',
    description:
      'Raise the annual staking reward rate to keep validator participation competitive with comparable testnets.',
    imageUrl: 'https://picsum.photos/seed/staking-rewards/800/450',
    category: 'technical',
    startsAt: daysFromNow(-20),
    endsAt: daysFromNow(-10),
    contractAddress: mockAddress('staking-rewards'),
    options: [
      { id: 'opt-increase', label: 'Increase rewards', votes: 1502 },
      { id: 'opt-unchanged', label: 'Keep rewards unchanged', votes: 1489 },
    ],
  },
  {
    id: 'poll-wallet-bounty',
    title: 'Fund open-source wallet integration bounty',
    description:
      'Allocate treasury funds to a public bounty for integrating two additional wallet providers into the voting client.',
    imageUrl: 'https://picsum.photos/seed/wallet-bounty/800/450',
    category: 'treasury',
    startsAt: daysFromNow(0),
    endsAt: daysFromNow(14),
    contractAddress: mockAddress('wallet-bounty'),
    options: [
      { id: 'opt-approve-bounty', label: 'Approve bounty funding', votes: 312 },
      { id: 'opt-reject-bounty', label: 'Reject bounty funding', votes: 89 },
      { id: 'opt-reduce-bounty', label: 'Reduce bounty amount', votes: 54 },
    ],
  },
];