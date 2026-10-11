# Pinned to a specific model, NOT a "-latest" alias. gemini-flash-latest
# resolved to gemini-3.8-flash and hit a 20-request/DAY free-tier quota wall
# during live testing (Oct 2026) -- the newest frontier model gets the
# stingiest free quota, so chasing "latest" is actively the wrong call for
# a free-tier-constrained project. gemini-3.1-flash-lite is a step behind
# the frontier and, empirically, not quota-walled under normal use.
# If this starts 404ing as "no longer available to new users" (also
# observed live, on gemini-2.5-flash/-lite), re-check available models
# and their quotas before just bumping to whatever's newest.
GEMINI_MODEL = "gemini-3.1-flash-lite"
