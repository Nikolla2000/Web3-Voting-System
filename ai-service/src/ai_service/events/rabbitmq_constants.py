"""Mirrors libs/shared/src/rabbitmq/rabbitmq.constants.ts — that file is the
single source of truth; keep this in sync by hand since it's a cross-language
boundary Python can't import directly."""

RABBITMQ_EXCHANGE = "voting_system"

ROUTING_KEY_POLL_CREATED = "poll.created"
