from pydantic import BaseModel


class NewsCreate(BaseModel):
    title: str
    description: str
    content: str
    category: str
    date: str
    image: str | None = None
