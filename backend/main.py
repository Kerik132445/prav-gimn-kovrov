import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import Base, engine
from routes.news import router as news_router
from routes.auth import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)


@app.middleware("http")
async def security_headers(request: Request, call_next):

    response = await call_next(request)

    response.headers["X-Content-Type-Options"] = "nosniff"

    response.headers["X-Frame-Options"] = "DENY"

    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    response.headers["Permissions-Policy"] = (
        "camera=(), "
        "microphone=(), "
        "geolocation=()"
    )

    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5501",
        "http://127.0.0.1:5501",
        "http://localhost:3000",
        "http://localhost:8000",
        "https://krytoi-site.tuqo.ru",
    ],
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount(
    "/uploads",
    StaticFiles(directory=UPLOADS_DIR),
    name="uploads"
)

app.include_router(news_router)
app.include_router(auth_router)


@app.get("/")
def root():

    return {
        "message": "Gymnasium API is alive"
    }
