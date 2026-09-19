import hashlib
import secrets
from datetime import datetime, timedelta, timezone

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
from models import Admin, AdminSession
from auth import verify_password


router = APIRouter(
    prefix="/api/auth",
    tags=["Auth"]
)


SESSION_DURATION_DAYS = 7


def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


class LoginData(BaseModel):

    username: str
    password: str


def hash_session_token(token: str) -> str:

    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def get_current_session(
    request: Request,
    db: Session
):

    token = request.cookies.get(
        "admin_session"
    )

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Требуется авторизация"
        )

    token_hash = hash_session_token(
        token
    )

    session = (
        db.query(AdminSession)
        .filter(
            AdminSession.token_hash ==
            token_hash
        )
        .first()
    )

    if not session:

        raise HTTPException(
            status_code=401,
            detail="Недействительная сессия"
        )

    now = datetime.now(timezone.utc)

    # SQLite возвращает DateTime без timezone,
    # поэтому приводим его к UTC.
    expires_at = session.expires_at

    if expires_at.tzinfo is None:

        expires_at = expires_at.replace(
            tzinfo=timezone.utc
        )

    if expires_at <= now:

        db.delete(session)
        db.commit()

        raise HTTPException(
            status_code=401,
            detail="Сессия истекла"
        )

    return session


# ========================================
# Вход
# ========================================

@router.post("/login")
def login(
    data: LoginData,
    response: Response,
    db: Session = Depends(get_db)
):

    admin = (
        db.query(Admin)
        .filter(
            Admin.username ==
            data.username
        )
        .first()
    )

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

    # Создаём новый случайный токен
    session_token = secrets.token_urlsafe(32)

    # В БД сохраняем только его SHA-256
    token_hash = hash_session_token(
        session_token
    )

    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(
            days=SESSION_DURATION_DAYS
        )
    )

    session = AdminSession(

        token_hash=token_hash,

        admin_id=admin.id,

        expires_at=expires_at
    )

    db.add(session)
    db.commit()

    response.set_cookie(

        key="admin_session",

        value=session_token,

        httponly=True,

        samesite="lax",

        secure=False,

        max_age=SESSION_DURATION_DAYS * 24 * 60 * 60
    )

    return {
        "message": "Вход выполнен"
    }


# ========================================
# Выход
# ========================================

@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):

    token = request.cookies.get(
        "admin_session"
    )

    if token:

        token_hash = hash_session_token(
            token
        )

        session = (
            db.query(AdminSession)
            .filter(
                AdminSession.token_hash ==
                token_hash
            )
            .first()
        )

        if session:

            db.delete(session)
            db.commit()

    response.delete_cookie(
        "admin_session"
    )

    return {
        "message": "Выход выполнен"
    }


# ========================================
# Проверка авторизации
# ========================================

def require_admin(
    request: Request,
    db: Session = Depends(get_db)
):

    session = get_current_session(
        request,
        db
    )

    return session.admin_id


# ========================================
# Текущий администратор
# ========================================

@router.get("/me")
def get_current_admin(

    request: Request,

    db: Session = Depends(get_db)
):

    admin_id = require_admin(
        request,
        db
    )

    admin = (
        db.query(Admin)
        .filter(
            Admin.id == admin_id
        )
        .first()
    )

    if not admin:

        raise HTTPException(
            status_code=401,
            detail="Администратор не найден"
        )

    return {

        "id": admin.id,

        "username": admin.username
    }
