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
from models import Admin, AdminSession, LoginAttempt
from auth import verify_password


router = APIRouter(
    prefix="/api/auth",
    tags=["Auth"]
)


SESSION_DURATION_DAYS = 7

MAX_LOGIN_ATTEMPTS = 5
LOGIN_BLOCK_MINUTES = 5


# =========================================================
# DATABASE
# =========================================================

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# =========================================================
# LOGIN DATA
# =========================================================

class LoginData(BaseModel):

    username: str
    password: str


# =========================================================
# SESSION TOKEN
# =========================================================

def hash_session_token(token: str) -> str:

    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


# =========================================================
# CURRENT SESSION
# =========================================================

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


# =========================================================
# LOGIN ATTEMPTS
# =========================================================

def get_login_attempt(
    db: Session,
    username: str,
    ip_address: str
):

    return (
        db.query(LoginAttempt)
        .filter(
            LoginAttempt.username == username,
            LoginAttempt.ip_address == ip_address
        )
        .first()
    )


def check_login_block(
    db: Session,
    username: str,
    ip_address: str
):

    attempt = get_login_attempt(
        db,
        username,
        ip_address
    )

    if not attempt:

        return None

    if not attempt.blocked_until:

        return attempt

    now = datetime.now(timezone.utc)

    blocked_until = attempt.blocked_until

    if blocked_until.tzinfo is None:

        blocked_until = blocked_until.replace(
            tzinfo=timezone.utc
        )

    if blocked_until <= now:

        attempt.failed_attempts = 0
        attempt.blocked_until = None

        db.commit()

        return attempt

    remaining_seconds = max(
        1,
        int(
            (
                blocked_until - now
            ).total_seconds()
        )
    )

    raise HTTPException(
        status_code=429,
        detail=(
            "Слишком много неудачных попыток. "
            f"Попробуйте через {remaining_seconds} сек."
        ),
        headers={
            "Retry-After": str(
                remaining_seconds
            )
        }
    )


def register_failed_login(
    db: Session,
    username: str,
    ip_address: str
):

    attempt = get_login_attempt(
        db,
        username,
        ip_address
    )

    if not attempt:

        attempt = LoginAttempt(
            username=username,
            ip_address=ip_address,
            failed_attempts=0
        )

        db.add(attempt)

    attempt.failed_attempts += 1

    if attempt.failed_attempts >= MAX_LOGIN_ATTEMPTS:

        attempt.blocked_until = (
            datetime.now(timezone.utc)
            + timedelta(
                minutes=LOGIN_BLOCK_MINUTES
            )
        )

        db.commit()

        return True

    db.commit()

    return False


def reset_login_attempts(
    db: Session,
    username: str,
    ip_address: str
):

    attempt = get_login_attempt(
        db,
        username,
        ip_address
    )

    if attempt:

        db.delete(attempt)
        db.commit()


# =========================================================
# CSRF
# =========================================================
CSRF_COOKIE_NAME = "csrf_token"
CSRF_HEADER_NAME = "X-CSRF-Token"


def create_csrf_token():
    return secrets.token_urlsafe(32)


@router.get("/csrf")
def get_csrf_token(
    request: Request,
    response: Response
):

    token = request.cookies.get(
        CSRF_COOKIE_NAME
    )

    if not token:

        token = create_csrf_token()

        response.set_cookie(
            key=CSRF_COOKIE_NAME,
            value=token,
            httponly=False,
            samesite="none",
            secure=True,
            max_age=7 * 24 * 60 * 60
        )

    return {
        "csrf_token": token
    }


def require_csrf(
    request: Request
):

    cookie_token = request.cookies.get(
        CSRF_COOKIE_NAME
    )

    header_token = request.headers.get(
        CSRF_HEADER_NAME
    )

    if not cookie_token or not header_token:

        raise HTTPException(
            status_code=403,
            detail="CSRF-токен отсутствует"
        )

    if not secrets.compare_digest(
        cookie_token,
        header_token
    ):

        raise HTTPException(
            status_code=403,
            detail="Недействительный CSRF-токен"
        )

# =========================================================
# LOGIN
# =========================================================


@router.post("/login")
def login(
    data: LoginData,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):

    username = data.username.strip()

    if request.client:

        ip_address = request.client.host

    else:

        ip_address = "unknown"

    # -----------------------------------------------------
    # Проверяем блокировку
    # -----------------------------------------------------

    check_login_block(
        db,
        username,
        ip_address
    )

    # -----------------------------------------------------
    # Ищем администратора
    # -----------------------------------------------------

    admin = (
        db.query(Admin)
        .filter(
            Admin.username ==
            username
        )
        .first()
    )

    # -----------------------------------------------------
    # Проверяем пароль
    # -----------------------------------------------------

    password_valid = False

    if admin:

        password_valid = verify_password(
            data.password,
            admin.password_hash
        )

    # -----------------------------------------------------
    # Неверный логин или пароль
    # -----------------------------------------------------

    if not admin or not password_valid:

        is_blocked = register_failed_login(
            db,
            username,
            ip_address
        )

        if is_blocked:

            raise HTTPException(
                status_code=429,
                detail=(
                    "Слишком много неудачных попыток. "
                    "Вход заблокирован на "
                    f"{LOGIN_BLOCK_MINUTES} минут."
                ),
                headers={
                    "Retry-After": str(
                        LOGIN_BLOCK_MINUTES * 60
                    )
                }
            )

        raise HTTPException(
            status_code=401,
            detail="Неверный логин или пароль"
        )

    # -----------------------------------------------------
    # Успешный вход
    # -----------------------------------------------------

    reset_login_attempts(
        db,
        username,
        ip_address
    )

    session_token = secrets.token_urlsafe(32)

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

    # -----------------------------------------------------
    # Cookie
    # -----------------------------------------------------

    response.set_cookie(
        key="admin_session",
        value=session_token,
        httponly=True,
        samesite="none",
        secure=True,
        max_age=SESSION_DURATION_DAYS * 24 * 60 * 60
    )

    return {
        "message": "Вход выполнен"
    }


# =========================================================
# LOGOUT
# =========================================================

@router.post("/logout")
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    csrf: None = Depends(require_csrf)
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
        "admin_session",
        samesite="none",
        secure=True
    )

    return {
        "message": "Выход выполнен"
    }


# =========================================================
# REQUIRE ADMIN
# =========================================================

def require_admin(
    request: Request,
    db: Session = Depends(get_db)
):

    session = get_current_session(
        request,
        db
    )

    return session.admin_id


# =========================================================
# CURRENT ADMIN
# =========================================================

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
