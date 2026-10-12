from google.genai import types

from ai_service.polls_client import get_poll_by_id, get_polls

GET_POLLS_DECLARATION = types.FunctionDeclaration(
    name="get_polls",
    description=(
        "List polls on the platform, with optional search/status filter and sort order. Use this to "
        "find which poll(s) a question is about -- e.g. most-voted, ending soonest, active right now, "
        "or matching a keyword."
    ),
    parameters_json_schema={
        "type": "object",
        "properties": {
            "search": {"type": "string", "description": "Free-text match on poll title, or empty string for none."},
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
            "limit": {"type": "integer", "description": "Max polls to return."},
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


async def execute_tool(name: str, args: dict) -> dict:
    if name == "get_polls":
        return await get_polls(
            search=args.get("search", ""),
            status=args.get("status", "all"),
            sort_by=args.get("sortBy", "newest"),
            limit=int(args.get("limit", 10)),
        )
    if name == "get_poll_by_id":
        return await get_poll_by_id(args["id"])
    return {"error": f"unknown tool '{name}'"}
