import html
import time
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    Query,
    Request,
    status,
)
from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from database import SessionLocal
from models import FeedbackMessage
from schemas import FeedbackCreate, FeedbackStatusUpdate, FeedbackOut, RostochekEnrollCreate
from routes.auth import require_admin, require_csrf
from email_service import send_feedback_notification_sync

# Московский часовой пояс (UTC+3)
MSK_TZ = timezone(timedelta(hours=3))

router = APIRouter(
    prefix="/api/feedback",
    tags=["Feedback"],
)

# Каталог соответствия тем страницам для автоматического надежного определения источника
TOPIC_TO_PAGE = {
    # Поступающим
    "Запись на собеседование с директором": "Поступающим",
    "Перевод ребенка из другой школы (2–11 классы)": "Поступающим",
    "Подготовительные занятия в центре «Росточек»": "Поступающим",
    "Вопрос по перечню документов и медкарте": "Поступающим",
    "Условия зачисления и наличие свободных мест": "Поступающим",
    # Школьное питание
    "Оформление диетического/аллергического питания": "Школьное питание",
    "Питание в группе продлённого дня (ГПД)": "Школьное питание",
    "Оплата питания и стоимость обедов (5–11 классы)": "Школьное питание",
    "Участие в комиссии родительского контроля": "Школьное питание",
    "Отзыв или предложение по меню столовой": "Школьное питание",
    # Расписание уроков
    "Вопрос по текущим изменениям в расписании": "Расписание уроков",
    "Расписание кружков и внеурочной деятельности": "Расписание уроков",
    "Индивидуальный график (совмещение с доп. образованием)": "Расписание уроков",
    "Освобождение от занятий по семейным обстоятельствам": "Расписание уроков",
    "Вопрос по расписанию звонков и перемен": "Расписание уроков",
    # Наши преподаватели
    "Запись на индивидуальную консультацию с учителем": "Наши преподаватели",
    "Связь с классным руководителем": "Наши преподаватели",
    "Консультация педагога-психолога / логопеда": "Наши преподаватели",
    "Вопрос завучу по учебно-воспитательной работе": "Наши преподаватели",
    "Отзыв или благодарность педагогу": "Наши преподаватели",
    # Документы
    "Заказ справки об обучении (для пособий, налоговой, военкомата)": "Документы",
    "Получение заверенной копии документа с печатью": "Документы",
    "Вопрос по локальным актам и уставу гимназии": "Документы",
    "Запрос договора об образовании или бланка заявления": "Документы",
    "Архивные справки и восстановление документов": "Документы",
    # Электронный дневник
    "Ошибка авторизации через Госуслуги": "Электронный дневник",
    "Ребенок не отображается в личном кабинете родителя": "Электронный дневник",
    "Не отображаются оценки или домашние задания": "Электронный дневник",
    "Обновление СНИЛС / персональных данных в системе": "Электронный дневник",
    "Техническая помощь по работе с электронным дневником": "Электронный дневник",
    # Контакты
    "Запись на личный приём к директору": "Контакты",
    "Вопрос в бухгалтерию гимназии": "Контакты",
    "Обращение в канцелярию / секретариат": "Контакты",
    "Сотрудничество и благотворительность": "Контакты",
    "Общий вопрос руководству гимназии": "Контакты",
    # Жизнь гимназии
    "Участие в школьных мероприятиях и праздниках": "Жизнь гимназии",
    "Паломнические поездки и экскурсии": "Жизнь гимназии",
    "Творческие кружки, хор и мастерские": "Жизнь гимназии",
    "Волонтерские и благотворительные проекты гимназии": "Жизнь гимназии",
    "Предложение по организации мероприятий": "Жизнь гимназии",
    # Главная страница
    "Поступление и приём документов": "Главная страница",
    "Вопрос по образовательному процессу": "Главная страница",
    "Группа продлённого дня (ГПД) и кружки": "Главная страница",
    "Духовная жизнь и гимназические традиции": "Главная страница",
    "Сотрудничество и поддержка гимназии": "Главная страница",
    # Центр «Росточек»
    "Подготовительные занятия в центре «Росточек»": "Центр «Росточек»",
    "Подготовка к школе «Учусь, играя»": "Центр «Росточек»",
    "Подготовка к школе «Год до школы»": "Центр «Росточек»",
    "«Английский для дошколят»": "Центр «Росточек»",
    "«Английский для школьников»": "Центр «Росточек»",
    "«Школа мяча»": "Центр «Росточек»",
    "Творческая мастерская «Золотые ручки»": "Центр «Росточек»",
    "«Умные математики»": "Центр «Росточек»",
    "Консультация руководителя центра": "Центр «Росточек»",
}

REFERER_MAPPINGS = [
    ("rostochek", "Центр «Росточек»"),
    ("schedule", "Расписание уроков"),
    ("food", "Школьное питание"),
    ("teacher", "Наши преподаватели"),
    ("apply", "Поступающим"),
    ("document", "Документы"),
    ("diary", "Электронный дневник"),
    ("dairy", "Электронный дневник"),
    ("contact", "Контакты"),
    ("life", "Жизнь гимназии"),
    ("index", "Главная страница"),
]

def _resolve_source_page(raw_source: Optional[str], subject: Optional[str], request: Request) -> str:
    if raw_source and raw_source.strip():
        return raw_source.strip()

    # Если тема есть в каталоге — определяем страницу по ней
    if subject and subject.strip() in TOPIC_TO_PAGE:
        return TOPIC_TO_PAGE[subject.strip()]

    # Если передан Referer — определяем по URL реферера
    referer = (request.headers.get("referer") or "").lower()
    if referer:
        for keyword, title in REFERER_MAPPINGS:
            if keyword in referer:
                return title

    return "Главная страница"


def _format_msk_iso(dt: Optional[datetime]) -> Optional[str]:
    """Форматирует дату со строгим смещением МСК (+03:00) для однозначного парсинга в браузере."""
    if not dt:
        return None
    return dt.strftime("%Y-%m-%dT%H:%M:%S+03:00")

# In-memory IP rate limiter: max 5 requests per 300 seconds (5 minutes)
_RATE_LIMIT_MAX = 5
_RATE_LIMIT_WINDOW = 300
_ip_timestamps = defaultdict(list)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _check_rate_limit(ip: str):
    now = time.time()
    cutoff = now - _RATE_LIMIT_WINDOW
    timestamps = [t for t in _ip_timestamps[ip] if t > cutoff]
    if len(timestamps) >= _RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Слишком много обращений. Пожалуйста, подождите несколько минут перед следующей отправкой.",
        )
    timestamps.append(now)
    _ip_timestamps[ip] = timestamps


# =========================================================
# PUBLIC ENDPOINT: SUBMIT FEEDBACK
# =========================================================

@router.post("/", status_code=status.HTTP_201_CREATED)
async def submit_feedback(
    payload: FeedbackCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    client_ip = _get_client_ip(request)
    _check_rate_limit(client_ip)

    # Honeypot spam check
    if payload.hp and payload.hp.strip():
        # Silently reject bots
        return {
            "ok": True,
            "message": "Ваше обращение успешно отправлено! Спасибо за обратную связь. Администрация гимназии рассмотрит ваше сообщение.",
        }

    # Sanitize inputs against XSS and strip
    clean_name = html.escape(payload.name.strip())
    clean_contact = html.escape(payload.contact.strip())
    clean_subject = html.escape(payload.subject.strip()) if payload.subject and payload.subject.strip() else None

    # Надежное автоопределение страницы источника обращения
    resolved_page = _resolve_source_page(payload.source_page, clean_subject, request)
    clean_source_page = html.escape(resolved_page)
    clean_message = html.escape(payload.message.strip())

    # Фиксируем точное Московское время (МСК, UTC+3)
    created_msk = datetime.now(MSK_TZ).replace(tzinfo=None)

    feedback = FeedbackMessage(
        name=clean_name,
        contact=clean_contact,
        subject=clean_subject,
        message=clean_message,
        status="new",
        ip_address=client_ip,
        source_page=clean_source_page,
        created_at=created_msk,
    )

    try:
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Не удалось сохранить обращение. Пожалуйста, попробуйте позже.",
        )

    # Queue email notification in background (failsafe, never throws)
    notification_payload = {
        "id": feedback.id,
        "name": clean_name,
        "contact": clean_contact,
        "subject": clean_subject or "Не указана",
        "source_page": clean_source_page or "Не указана",
        "message": clean_message,
        "created_at": feedback.created_at.strftime("%d.%m.%Y %H:%M (МСК)"),
        "ip_address": client_ip,
    }
    background_tasks.add_task(send_feedback_notification_sync, notification_payload)

    return {
        "ok": True,
        "id": feedback.id,
        "message": "Ваше обращение успешно отправлено! Спасибо за обратную связь. Администрация гимназии рассмотрит ваше сообщение.",
    }


@router.post("/rostochek", status_code=status.HTTP_201_CREATED)
async def submit_rostochek_enrollment(
    payload: RostochekEnrollCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    client_ip = _get_client_ip(request)
    _check_rate_limit(client_ip)

    # Honeypot spam check
    if payload.hp and payload.hp.strip():
        return {
            "ok": True,
            "message": "Заявка на запись в центр «Росточек» успешно принята! Руководитель центра свяжется с вами в ближайшее время.",
        }

    clean_parent = html.escape(payload.parent_name.strip())
    clean_child = html.escape(payload.child_name.strip())
    clean_age = html.escape(payload.child_age.strip())
    clean_course = html.escape(payload.course.strip())
    clean_contact = html.escape(payload.contact.strip())
    clean_comment = html.escape(payload.comment.strip()) if payload.comment and payload.comment.strip() else None

    composite_name = f"{clean_parent} (ребёнок: {clean_child}, {clean_age})"
    subject = f"Запись в «Росточек»: {clean_course}"
    source_page = "Центр «Росточек»"

    message_parts = [
        f"Программа: {clean_course}",
        f"Имя родителя: {clean_parent}",
        f"Имя ребёнка: {clean_child}",
        f"Возраст ребёнка: {clean_age}",
    ]
    if clean_comment:
        message_parts.append(f"Комментарий: {clean_comment}")
    formatted_message = "\n".join(message_parts)

    created_msk = datetime.now(MSK_TZ).replace(tzinfo=None)

    feedback = FeedbackMessage(
        name=composite_name,
        contact=clean_contact,
        subject=subject,
        message=formatted_message,
        status="new",
        ip_address=client_ip,
        source_page=source_page,
        created_at=created_msk,
    )

    try:
        db.add(feedback)
        db.commit()
        db.refresh(feedback)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Не удалось сохранить заявку. Пожалуйста, попробуйте позже.",
        )

    notification_payload = {
        "id": feedback.id,
        "name": composite_name,
        "contact": clean_contact,
        "subject": subject,
        "source_page": source_page,
        "message": formatted_message,
        "created_at": feedback.created_at.strftime("%d.%m.%Y %H:%M (МСК)"),
        "ip_address": client_ip,
    }
    background_tasks.add_task(send_feedback_notification_sync, notification_payload)

    return {
        "ok": True,
        "id": feedback.id,
        "message": "Заявка на запись в центр «Росточек» успешно принята! Руководитель центра Оксана Александровна Борисенко свяжется с вами в ближайшее время.",
    }


# =========================================================
# PROTECTED ADMIN ENDPOINTS
# =========================================================

@router.get("/stats")
def get_feedback_stats(
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
):
    total = db.query(func.count(FeedbackMessage.id)).scalar() or 0
    new_count = (
        db.query(func.count(FeedbackMessage.id))
        .filter(FeedbackMessage.status == "new")
        .scalar()
        or 0
    )
    processed = (
        db.query(func.count(FeedbackMessage.id))
        .filter(FeedbackMessage.status == "processed")
        .scalar()
        or 0
    )
    return {
        "total": total,
        "new": new_count,
        "processed": processed,
    }


@router.get("/")
def list_feedback(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
):
    query = db.query(FeedbackMessage)

    if status_filter and status_filter in ("new", "processed"):
        query = query.filter(FeedbackMessage.status == status_filter)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                FeedbackMessage.name.ilike(term),
                FeedbackMessage.contact.ilike(term),
                FeedbackMessage.subject.ilike(term),
                FeedbackMessage.message.ilike(term),
                FeedbackMessage.source_page.ilike(term),
            )
        )

    total = query.count()
    items = query.order_by(FeedbackMessage.created_at.desc()).offset(offset).limit(limit).all()

    unread_count = (
        db.query(func.count(FeedbackMessage.id))
        .filter(FeedbackMessage.status == "new")
        .scalar()
        or 0
    )

    return {
        "items": [
            {
                "id": item.id,
                "name": item.name,
                "contact": item.contact,
                "subject": item.subject,
                "source_page": item.source_page or (TOPIC_TO_PAGE.get(item.subject.strip()) if item.subject and item.subject.strip() in TOPIC_TO_PAGE else "Не указана"),
                "message": item.message,
                "status": item.status,
                "ip_address": item.ip_address,
                "created_at": _format_msk_iso(item.created_at),
            }
            for item in items
        ],
        "total": total,
        "unread_count": unread_count,
    }


@router.get("/{feedback_id}")
def get_feedback_detail(
    feedback_id: int,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
):
    item = db.query(FeedbackMessage).filter(FeedbackMessage.id == feedback_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Обращение не найдено",
        )
    return {
        "id": item.id,
        "name": item.name,
        "contact": item.contact,
        "subject": item.subject,
        "source_page": item.source_page or (TOPIC_TO_PAGE.get(item.subject.strip()) if item.subject and item.subject.strip() in TOPIC_TO_PAGE else "Не указана"),
        "message": item.message,
        "status": item.status,
        "ip_address": item.ip_address,
        "created_at": _format_msk_iso(item.created_at),
    }


@router.patch("/{feedback_id}/status")
def update_feedback_status(
    feedback_id: int,
    payload: FeedbackStatusUpdate,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    item = db.query(FeedbackMessage).filter(FeedbackMessage.id == feedback_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Обращение не найдено",
        )

    item.status = payload.status
    db.commit()
    db.refresh(item)

    unread_count = (
        db.query(func.count(FeedbackMessage.id))
        .filter(FeedbackMessage.status == "new")
        .scalar()
        or 0
    )

    return {
        "ok": True,
        "item": {
            "id": item.id,
            "status": item.status,
        },
        "unread_count": unread_count,
    }


@router.delete("/{feedback_id}")
def delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    item = db.query(FeedbackMessage).filter(FeedbackMessage.id == feedback_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Обращение не найдено",
        )

    db.delete(item)
    db.commit()

    unread_count = (
        db.query(func.count(FeedbackMessage.id))
        .filter(FeedbackMessage.status == "new")
        .scalar()
        or 0
    )

    return {
        "ok": True,
        "id": feedback_id,
        "unread_count": unread_count,
    }
