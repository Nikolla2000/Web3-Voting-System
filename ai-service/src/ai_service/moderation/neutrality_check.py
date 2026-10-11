from dataclasses import dataclass

from ai_service.llm.gemini_client import extract_structured

_SCHEMA = {
    "type": "object",
    "properties": {
        "is_neutral": {
            "type": "boolean",
            "description": "True only if the title and every option are neutrally framed, with no issues.",
        },
        "issues": {
            "type": "array",
            "description": "Empty if is_neutral is true.",
            "items": {
                "type": "object",
                "properties": {
                    "text": {
                        "type": "string",
                        "description": "The exact title or option text this issue is about, copied verbatim from the input.",
                    },
                    "explanation": {
                        "type": "string",
                        "description": "One concise sentence on why this framing isn't neutral.",
                    },
                    "suggestion": {
                        "type": "string",
                        "description": "A neutrally-reworded replacement for this exact text.",
                    },
                },
                "required": ["text", "explanation", "suggestion"],
            },
        },
    },
    "required": ["is_neutral", "issues"],
}

_PROMPT_TEMPLATE = """You are reviewing a poll for a voting platform, checking that its framing is \
neutral and doesn't lead voters toward a particular answer. Flag:
- A title that presupposes an answer, uses loaded/emotive language, or frames the issue one-sidedly.
- Options where one is phrased far more favorably/unfavorably than the others (not just differing in \
substance -- differing *tone* is the issue).
- An option that straw-mans or caricatures a real position.

Do NOT flag an option just because it's one choice among several, or because the topic itself is \
controversial -- only flag actual wording/framing problems.

Title: {title}
Options:
{options}"""


@dataclass
class NeutralityIssue:
    text: str
    explanation: str
    suggestion: str


@dataclass
class NeutralityResult:
    is_neutral: bool
    issues: list[NeutralityIssue]


async def check_poll_neutrality(title: str, options: list[str]) -> NeutralityResult:
    options_block = "\n".join(f"- {option}" for option in options)
    prompt = _PROMPT_TEMPLATE.format(title=title, options=options_block)

    data = await extract_structured(prompt, _SCHEMA)

    return NeutralityResult(
        is_neutral=data["is_neutral"],
        issues=[NeutralityIssue(**issue) for issue in data["issues"]],
    )
