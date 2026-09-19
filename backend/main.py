from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routes.news import router as news_router

from fastapi.staticfiles import StaticFiles

from routes.news import router as news_router
from routes.auth import router as auth_router


Base.metadata.create_all(bind=engine)


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5501",
        "http://127.0.0.1:5501"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

app.include_router(news_router)
app.include_router(auth_router)


@app.get("/")
def root():

    return {
        "message": "Gymnasium API is alive"
    }
