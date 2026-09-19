import secrets

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    Response
)

from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Admin
from auth import verify_password


router = APIRouter(
    prefix="/api/auth",
    tags=["Auth"]
)


sessions = {}


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


class LoginData(BaseModel):

    username: str
    password: str


@router.post("/login")
def login(
    data: LoginData,
    response: Response,
    db: Session = Depends(get_db)
):

    admin = db.query(Admin).filter(
        Admin.username == data.username
    ).first()

    if not admin:

        raise HTTPException(
            status_code=401,
            detail="Неверный логин или пароль"
        )

    if not verify_password(
        data.password,
        admin.password_hash
    ):

        raise HTTPException(
            status_code=401,
            detail="Неверный логин или пароль"
        )

    session_token = secrets.token_urlsafe(32)

    sessions[session_token] = admin.id

    response.set_cookie(
        key="admin_session",
        value=session_token,
        httponly=True,
        samesite="lax",
        secure=False
    )

    return {
        "message": "Вход выполнен"
    }


@router.post("/logout")
def logout(
    request: Request,
    response: Response
):

    token = request.cookies.get(
        "admin_session"
    )

    if token:

        sessions.pop(
            token,
            None
        )

    response.delete_cookie(
        "admin_session"
    )

    return {
        "message": "Выход выполнен"
    }


def require_admin(
    request: Request
):

    token = request.cookies.get(
        "admin_session"
    )

    if not token or token not in sessions:

        raise HTTPException(
            status_code=401,
            detail="Требуется авторизация"
        )

    return sessions[token]


@router.get("/me")
def get_current_admin(
    request: Request,
    db: Session = Depends(get_db)
):

    admin_id = require_admin(request)

    admin = db.query(Admin).filter(
        Admin.id == admin_id
    ).first()

    if not admin:

        raise HTTPException(
            status_code=401,
            detail="Администратор не найден"
        )

    return {
        "id": admin.id,
        "username": admin.username
    }
