import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import Base, engine
from routes.news import router as news_router
from routes.auth import router as auth_router
from routes.teachers import router as teachers_router
from routes.schedule import router as schedule_router
from routes.menu import router as menu_router
from routes.feedback import router as feedback_router
from routes.gym_life import router as gym_life_router
from routes.documents import router as documents_router
from routes.calendar import router as calendar_router

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
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "https://krytoi-site.tuqo.ru",
        "https://kerik132445.github.io",
    ],
    allow_origin_regex=r"^https:\/\/.*(\.github\.io|\.vercel\.app)$",
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
app.include_router(teachers_router)
app.include_router(schedule_router)
app.include_router(menu_router)
app.include_router(feedback_router)
app.include_router(gym_life_router)
app.include_router(documents_router)
app.include_router(calendar_router)


@app.get("/api/health")
def health():
    return {
        "message": "Gymnasium API is alive"
    }

FRONTEND_DIR = os.path.dirname(BASE_DIR)
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

