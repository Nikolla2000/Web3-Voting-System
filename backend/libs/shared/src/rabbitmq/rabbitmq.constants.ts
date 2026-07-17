export const RABBITMQ_EXCHANGE = 'voting_system';

export const ROUTING_KEYS = {
  USER_REGISTERED: 'user.registered',
} as const;

export type RoutingKey = (typeof ROUTING_KEYS)[keyof typeof ROUTING_KEYS];