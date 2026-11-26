from google.genai import types

from ai_service.polls_client import get_poll_by_id, get_polls

GET_POLLS_DECLARATION = types.FunctionDeclaration(
    name="get_polls",
    description=(
        "List polls on the platform, with optional search/status filter and sort order. Use this to "
        "find which poll(s) a question is about -- e.g. most-voted, ending soonest, active right now, "
        "or about a topic. Each poll comes with its category and description. For a topic question, "
        "prefer an empty search and pick the relevant polls from the results yourself: search only "
        "matches literal text in poll titles, and titles are phrased as questions."
    ),
    parameters_json_schema={
        "type": "object",
        "properties": {
            "search": {
                "type": "string",
                "description": (
                    "One short word that must appear literally in the poll title, e.g. 'city'. Empty "
                    "string for none. Never a phrase."
                ),
            },
            "status": {
                "type": "string",
                "enum": ["all", "active", "upcoming", "ended"],
                "description": "Filter by poll status.",
            },
            "sortBy": {
                "type": "string",
                "enum": ["newest", "endingSoon", "mostVotes", "alphabetical"],
                "description": "Sort order.",
            },
            "limit": {"type": "integer", "description": "Max polls to return. Use 50 for topic questions."},
        },
        "required": ["search", "status", "sortBy", "limit"],
    },
)

GET_POLL_BY_ID_DECLARATION = types.FunctionDeclaration(
    name="get_poll_by_id",
    description=(
        "Get full details of one specific poll by id, including its exact per-option vote counts and "
        "dates. Use this after get_polls has identified the relevant poll's id, to get precise numbers."
    ),
    parameters_json_schema={
        "type": "object",
        "properties": {"id": {"type": "string", "description": "The poll's id."}},
        "required": ["id"],
    },
)

TOOLS = [types.Tool(function_declarations=[GET_POLLS_DECLARATION, GET_POLL_BY_ID_DECLARATION])]


# Ceiling on one listing, so a broad question can't pull an unbounded amount
# of poll data into the prompt.
MAX_LIMIT = 50


async def execute_tool(name: str, args: dict) -> dict:
    if name == "get_polls":
        search = args.get("search", "").strip()
        status = args.get("status", "all")
        sort_by = args.get("sortBy", "newest")
        limit = max(1, min(int(args.get("limit", 10)), MAX_LIMIT))

        result = await get_polls(search=search, status=status, sort_by=sort_by, limit=limit)
        if search and not result["items"]:
            # The model still searches with topic words ("sports") that don't
            # appear in a question-style title ("Which sport is..."). Hand it
            # the unfiltered list rather than a dead end it reports as "no polls".
            result = await get_polls(search="", status=status, sort_by=sort_by, limit=MAX_LIMIT)
            result["note"] = (
                f"No poll title contains '{search}'. These are all polls; pick the relevant ones by "
                "title, description and category."
            )
        return result
    if name == "get_poll_by_id":
        return await get_poll_by_id(args["id"])
    return {"error": f"unknown tool '{name}'"}
