from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from pydantic import ValidationError
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import SessionLocal
from media import delete_file_by_url, ensure_upload_subdir, save_validated_image
from models import ScheduleLesson, Teacher
from routes.auth import require_admin, require_csrf
from schemas import TEACHER_CATEGORIES, TeacherOut, TeacherPayload, TeacherReorderRequest

router = APIRouter(
    prefix="/api/teachers",
    tags=["Teachers"],
)

ensure_upload_subdir("teachers")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _parse_optional_int(raw_value: str | None, field_label: str) -> int | None:
    if raw_value is None:
        return None
    text = str(raw_value).strip()
    if not text:
        return None
    try:
        return int(text)
    except ValueError:
        raise HTTPException(
            status_code=422,
            detail=f"Поле «{field_label}» должно быть целым числом",
        )


def _validate_teacher_fields(
    last_name: str,
    first_name: str,
    middle_name: str,
    position: str,
    category: str | None,
    classroom_guidance: str | None,
    experience_years: str | None,
    qualification: str | None,
    sort_order: int,
) -> TeacherPayload:
    exp_int = _parse_optional_int(experience_years, "Педагогический стаж")
    try:
        return TeacherPayload(
            last_name=last_name,
            first_name=first_name,
            middle_name=middle_name,
            position=position,
            category=category or "other",
            classroom_guidance=classroom_guidance,
            experience_years=exp_int,
            qualification=qualification,
            sort_order=sort_order,
        )
    except ValidationError as exc:
        first_err = exc.errors()[0]
        msg = first_err.get("msg", "Некорректные данные")
        if msg.startswith("Value error, "):
            msg = msg[len("Value error, "):]
        raise HTTPException(status_code=422, detail=msg)


def _delete_photo_if_unused(
    db: Session,
    photo_url: str | None,
    exclude_teacher_id: int | None = None,
) -> None:
    """Remove uploaded teacher photo from disk only if no other teacher uses it."""
    if not photo_url:
        return
    query = db.query(Teacher.id).filter(Teacher.photo == photo_url)
    if exclude_teacher_id is not None:
        query = query.filter(Teacher.id != exclude_teacher_id)
    if query.first() is not None:
        return
    delete_file_by_url(photo_url, subdir="teachers")


@router.get("/", response_model=list[TeacherOut])
def get_teachers(
    category: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Teacher)
    if category:
        if category not in TEACHER_CATEGORIES:
            raise HTTPException(status_code=400, detail="Некорректная категория")
        query = query.filter(Teacher.category == category)
    return query.order_by(Teacher.sort_order.asc(), Teacher.id.asc()).all()


@router.patch("/reorder", response_model=list[TeacherOut])
def reorder_teachers(
    payload: TeacherReorderRequest,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    order_map = {item.id: item.sort_order for item in payload.items}
    teachers = db.query(Teacher).filter(Teacher.id.in_(order_map.keys())).all()
    if len(teachers) != len(order_map):
        raise HTTPException(status_code=404, detail="Один или несколько преподавателей не найдены")

    for teacher in teachers:
        teacher.sort_order = order_map[teacher.id]

    db.commit()
    return db.query(Teacher).order_by(Teacher.sort_order.asc(), Teacher.id.asc()).all()


@router.get("/{teacher_id}", response_model=TeacherOut)
def get_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Преподаватель не найден")
    return teacher


@router.post("/", response_model=TeacherOut, status_code=status.HTTP_201_CREATED)
async def create_teacher(
    last_name: str = Form(...),
    first_name: str = Form(...),
    middle_name: str = Form(...),
    position: str = Form(...),
    category: str = Form("other"),
    classroom_guidance: str | None = Form(None),
    experience_years: str | None = Form(None),
    qualification: str | None = Form(None),
    sort_order: str | None = Form(None),
    photo: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    parsed_order = _parse_optional_int(sort_order, "Порядок отображения")
    if parsed_order is None:
        max_order = db.query(func.max(Teacher.sort_order)).scalar()
        parsed_order = (max_order + 10) if max_order is not None else 10

    validated = _validate_teacher_fields(
        last_name=last_name,
        first_name=first_name,
        middle_name=middle_name,
        position=position,
        category=category,
        classroom_guidance=classroom_guidance,
        experience_years=experience_years,
        qualification=qualification,
        sort_order=parsed_order,
    )

    if not photo or not photo.filename:
        raise HTTPException(status_code=400, detail="Фотография преподавателя обязательна")

    photo_url = await save_validated_image(photo, "teachers")

    teacher = Teacher(
        last_name=validated.last_name,
        first_name=validated.first_name,
        middle_name=validated.middle_name,
        photo=photo_url,
        position=validated.position,
        category=validated.category,
        classroom_guidance=validated.classroom_guidance,
        experience_years=validated.experience_years,
        qualification=validated.qualification,
        sort_order=validated.sort_order,
    )

    try:
        db.add(teacher)
        db.commit()
        db.refresh(teacher)
    except Exception:
        db.rollback()
        delete_file_by_url(photo_url, subdir="teachers")
        raise

    return teacher


@router.put("/{teacher_id}", response_model=TeacherOut)
async def update_teacher(
    teacher_id: int,
    last_name: str = Form(...),
    first_name: str = Form(...),
    middle_name: str = Form(...),
    position: str = Form(...),
    category: str = Form("other"),
    classroom_guidance: str | None = Form(None),
    experience_years: str | None = Form(None),
    qualification: str | None = Form(None),
    sort_order: str | None = Form(None),
    photo: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Преподаватель не найден")

    parsed_order = _parse_optional_int(sort_order, "Порядок отображения")
    if parsed_order is None:
        parsed_order = teacher.sort_order

    validated = _validate_teacher_fields(
        last_name=last_name,
        first_name=first_name,
        middle_name=middle_name,
        position=position,
        category=category,
        classroom_guidance=classroom_guidance,
        experience_years=experience_years,
        qualification=qualification,
        sort_order=parsed_order,
    )

    old_photo_url = teacher.photo
    new_photo_url: str | None = None

    if photo and photo.filename:
        new_photo_url = await save_validated_image(photo, "teachers")

    teacher.last_name = validated.last_name
    teacher.first_name = validated.first_name
    teacher.middle_name = validated.middle_name
    teacher.position = validated.position
    teacher.category = validated.category
    teacher.classroom_guidance = validated.classroom_guidance
    teacher.experience_years = validated.experience_years
    teacher.qualification = validated.qualification
    teacher.sort_order = validated.sort_order
    if new_photo_url:
        teacher.photo = new_photo_url

    try:
        db.commit()
        db.refresh(teacher)
    except Exception:
        db.rollback()
        if new_photo_url:
            delete_file_by_url(new_photo_url, subdir="teachers")
        raise

    if new_photo_url and old_photo_url != new_photo_url:
        _delete_photo_if_unused(db, old_photo_url, exclude_teacher_id=teacher.id)

    return teacher


@router.delete("/{teacher_id}")
def delete_teacher(
    teacher_id: int,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Преподаватель не найден")

    photo_url = teacher.photo
    db.query(ScheduleLesson).filter(ScheduleLesson.teacher_id == teacher_id).update(
        {ScheduleLesson.teacher_id: None},
        synchronize_session=False,
    )
    db.delete(teacher)
    db.commit()

    _delete_photo_if_unused(db, photo_url)

    return {
        "message": "Преподаватель удалён",
        "id": teacher_id,
    }
