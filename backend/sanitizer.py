import bleach


ALLOWED_TAGS = [
    "p",
    "br",
    "div",
    "strong",
    "b",
    "em",
    "i",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "a",
]


ALLOWED_ATTRIBUTES = {
    "a": [
        "href",
        "title",
        "target",
        "rel",
    ]
}


ALLOWED_PROTOCOLS = [
    "http",
    "https",
    "mailto",
]


def sanitize_html(value: str) -> str:

    if not value:
        return ""

    cleaned = bleach.clean(
        value,
        tags=ALLOWED_TAGS,
        attributes=ALLOWED_ATTRIBUTES,
        protocols=ALLOWED_PROTOCOLS,
        strip=True,
    )

    return cleaned
