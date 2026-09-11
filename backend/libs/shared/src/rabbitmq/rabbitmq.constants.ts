export const RABBITMQ_EXCHANGE = 'voting_system';

export const ROUTING_KEYS = {
  USER_REGISTERED: 'user.registered',
  VOTE_CAST: 'polls.vote_cast',
  POLL_CREATED: 'poll.created'
} as const;

export type RoutingKey = (typeof ROUTING_KEYS)[keyof typeof ROUTING_KEYS];