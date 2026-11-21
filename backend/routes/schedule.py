from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from database import SessionLocal
from models import ScheduleLesson, SchoolClass, Teacher
from routes.auth import require_admin, require_csrf
from schedule_parser import parse_schedule_file
from schemas import (
    SCHEDULE_DAYS,
    ScheduleCopyClassRequest,
    ScheduleCopyDayRequest,
    ScheduleImportApplyRequest,
    ScheduleLessonOut,
    ScheduleLessonPayload,
    ScheduleReorderRequest,
    SchoolClassCreate,
    SchoolClassOut,
    infer_class_grade_and_building,
)

router = APIRouter(
    prefix="/api/schedule",
    tags=["Schedule"],
)

DAY_LABELS = {
    "mon": "Понедельник",
    "tue": "Вторник",
    "wed": "Среда",
    "thu": "Четверг",
    "fri": "Пятница",
    "sat": "Суббота",
}


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _class_sort_key(school_class: SchoolClass) -> tuple[int, int, str]:
    grade = school_class.grade
    return (
        0 if grade is not None else 1,
        grade if grade is not None else 999,
        school_class.name.lower(),
    )


def _format_teacher_full(teacher: Teacher | None) -> str | None:
    if not teacher:
        return None
    parts = [teacher.last_name, teacher.first_name, teacher.middle_name]
    return " ".join(part for part in parts if part)


def _format_teacher_short(teacher: Teacher | None) -> str | None:
    if not teacher:
        return None
    initials = ""
    if teacher.first_name:
        initials += f"{teacher.first_name[0]}."
    if teacher.middle_name:
        initials += f"{teacher.middle_name[0]}."
    return f"{teacher.last_name} {initials}".strip()


def _serialize_lesson(
    lesson: ScheduleLesson,
    combined_slots: set | None = None,
    db: Session | None = None,
) -> ScheduleLessonOut:
    school_class = lesson.school_class
    teacher = lesson.teacher
    is_comb = False
    if lesson.teacher_id:
        if combined_slots is not None:
            key = (lesson.teacher_id, lesson.day_of_week, lesson.start_time, lesson.end_time)
            is_comb = key in combined_slots
        elif db is not None:
            is_comb = (
                db.query(ScheduleLesson.id)
                .filter(
                    ScheduleLesson.id != lesson.id,
                    ScheduleLesson.teacher_id == lesson.teacher_id,
                    ScheduleLesson.day_of_week == lesson.day_of_week,
                    ScheduleLesson.start_time == lesson.start_time,
                    ScheduleLesson.end_time == lesson.end_time,
                    ScheduleLesson.period == lesson.period,
                )
                .first()
                is not None
            )

    return ScheduleLessonOut(
        id=lesson.id,
        class_id=lesson.class_id,
        class_name=school_class.name if school_class else "",
        building=school_class.building if school_class else "pokrovsky",
        day_of_week=lesson.day_of_week,
        lesson_number=lesson.lesson_number,
        subject=lesson.subject,
        start_time=lesson.start_time,
        end_time=lesson.end_time,
        room=lesson.room,
        teacher_id=lesson.teacher_id,
        teacher_name=_format_teacher_full(teacher),
        teacher_short_name=_format_teacher_short(teacher),
        period=lesson.period,
        sort_order=lesson.sort_order,
        is_combined=is_comb,
    )


def _times_overlap(start_a: str, end_a: str, start_b: str, end_b: str) -> bool:
    return start_a < end_b and end_a > start_b


def _check_lesson_conflicts(
    db: Session,
    *,
    school_class: SchoolClass,
    day_of_week: str,
    lesson_number: int,
    subject: str,
    start_time: str,
    end_time: str,
    teacher: Teacher | None,
    period: str,
    exclude_lesson_ids: set[int] | None = None,
    allow_combined: bool = False,
) -> None:
    excluded = exclude_lesson_ids or set()
    day_label = DAY_LABELS.get(day_of_week, day_of_week)

    same_class_query = db.query(ScheduleLesson).filter(
        ScheduleLesson.class_id == school_class.id,
        ScheduleLesson.day_of_week == day_of_week,
        ScheduleLesson.period == period,
    )
    if excluded:
        same_class_query = same_class_query.filter(~ScheduleLesson.id.in_(excluded))

    for existing in same_class_query.all():
        if existing.lesson_number == lesson_number:
            raise HTTPException(
                status_code=409,
                detail=(
                    f"В классе {school_class.name} ({day_label}) уже есть "
                    f"{lesson_number} урок («{existing.subject}», {existing.start_time}–{existing.end_time})."
                ),
            )
        if _times_overlap(start_time, end_time, existing.start_time, existing.end_time):
            if (
                existing.subject.strip().lower() == subject.strip().lower()
                and existing.start_time == start_time
                and existing.end_time == end_time
            ):
                raise HTTPException(
                    status_code=409,
                    detail=(
                        f"Дублирующийся урок в классе {school_class.name} ({day_label}): "
                        f"«{existing.subject}» ({existing.start_time}–{existing.end_time})."
                    ),
                )
            raise HTTPException(
                status_code=409,
                detail=(
                    f"Время {start_time}–{end_time} в классе {school_class.name} ({day_label}) "
                    f"пересекается с уроком №{existing.lesson_number} "
                    f"(«{existing.subject}», {existing.start_time}–{existing.end_time})."
                ),
            )

    if teacher is not None:
        teacher_query = (
            db.query(ScheduleLesson)
            .options(joinedload(ScheduleLesson.school_class))
            .filter(
                ScheduleLesson.teacher_id == teacher.id,
                ScheduleLesson.day_of_week == day_of_week,
                ScheduleLesson.period == period,
            )
        )
        if excluded:
            teacher_query = teacher_query.filter(~ScheduleLesson.id.in_(excluded))

        teacher_full = _format_teacher_full(teacher) or f"ID {teacher.id}"
        for existing in teacher_query.all():
            if _times_overlap(start_time, end_time, existing.start_time, existing.end_time):
                conflict_class = existing.school_class.name if existing.school_class else str(existing.class_id)
                msg = (
                    f"Преподаватель {teacher_full} уже занят в это время ({day_label}, "
                    f"{existing.start_time}–{existing.end_time}): класс {conflict_class}, "
                    f"предмет «{existing.subject}»."
                )
                if not allow_combined:
                    raise HTTPException(
                        status_code=409,
                        detail={
                            "code": "TEACHER_CONFLICT",
                            "can_combine": True,
                            "message": msg,
                            "conflict_class": conflict_class,
                            "conflict_subject": existing.subject,
                            "conflict_time": f"{existing.start_time}–{existing.end_time}",
                            "teacher_name": teacher_full,
                        },
                    )


def _get_school_class_or_404(db: Session, class_id: int) -> SchoolClass:
    school_class = db.query(SchoolClass).filter(SchoolClass.id == class_id).first()
    if not school_class:
        raise HTTPException(status_code=404, detail="Класс не найден")
    return school_class


def _get_teacher_or_404(db: Session, teacher_id: int | None) -> Teacher | None:
    if teacher_id is None:
        return None
    teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Выбранный преподаватель не найден")
    return teacher


@router.get("/classes", response_model=list[SchoolClassOut])
def get_classes(
    period: str = Query(default="main"),
    db: Session = Depends(get_db),
):
    counts_rows = (
        db.query(ScheduleLesson.class_id, func.count(ScheduleLesson.id))
        .filter(ScheduleLesson.period == period)
        .group_by(ScheduleLesson.class_id)
        .all()
    )
    counts_map = {cid: cnt for cid, cnt in counts_rows}
    classes = sorted(db.query(SchoolClass).all(), key=_class_sort_key)
    return [
        SchoolClassOut(
            id=c.id,
            name=c.name,
            grade=c.grade,
            building=c.building,
            lessons_count=counts_map.get(c.id, 0),
        )
        for c in classes
    ]


def _find_class_by_name(db: Session, name: str) -> SchoolClass | None:
    target = (name or "").strip().casefold()
    if not target:
        return None
    for item in db.query(SchoolClass).all():
        if item.name.strip().casefold() == target:
            return item
    return None


@router.post("/classes", response_model=SchoolClassOut)
def create_class(
    data: SchoolClassCreate,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    existing = _find_class_by_name(db, data.name)
    if existing:
        raise HTTPException(status_code=409, detail=f"Класс «{existing.name}» уже существует")

    grade, building = infer_class_grade_and_building(data.name, data.building)
    new_class = SchoolClass(
        name=data.name,
        grade=grade,
        building=building,
    )
    db.add(new_class)
    db.commit()
    db.refresh(new_class)

    return SchoolClassOut(
        id=new_class.id,
        name=new_class.name,
        grade=new_class.grade,
        building=new_class.building,
        lessons_count=0,
    )


@router.delete("/classes/{class_id}")
def delete_class(
    class_id: int,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    school_class = _get_school_class_or_404(db, class_id)
    deleted_name = school_class.name
    db.delete(school_class)
    db.commit()
    return {"message": f"Класс «{deleted_name}» и его расписание удалены", "id": class_id}


@router.get("/", response_model=list[ScheduleLessonOut])
def get_schedule(
    class_id: int | None = Query(default=None),
    class_name: str | None = Query(default=None),
    day_of_week: str | None = Query(default=None),
    period: str = Query(default="main"),
    db: Session = Depends(get_db),
):
    query = (
        db.query(ScheduleLesson)
        .options(
            joinedload(ScheduleLesson.school_class),
            joinedload(ScheduleLesson.teacher),
        )
        .filter(ScheduleLesson.period == period)
    )

    if class_id is not None:
        query = query.filter(ScheduleLesson.class_id == class_id)
    elif class_name is not None:
        target_class = _find_class_by_name(db, class_name)
        if not target_class:
            return []
        query = query.filter(ScheduleLesson.class_id == target_class.id)

    if day_of_week is not None:
        cleaned_day = day_of_week.strip().lower()
        if cleaned_day not in SCHEDULE_DAYS:
            raise HTTPException(status_code=400, detail="Некорректный день недели")
        query = query.filter(ScheduleLesson.day_of_week == cleaned_day)

    lessons = query.order_by(
        ScheduleLesson.class_id.asc(),
        ScheduleLesson.day_of_week.asc(),
        ScheduleLesson.lesson_number.asc(),
        ScheduleLesson.sort_order.asc(),
        ScheduleLesson.start_time.asc(),
        ScheduleLesson.id.asc(),
    ).all()

    combined_rows = (
        db.query(
            ScheduleLesson.teacher_id,
            ScheduleLesson.day_of_week,
            ScheduleLesson.start_time,
            ScheduleLesson.end_time,
        )
        .filter(ScheduleLesson.teacher_id.isnot(None), ScheduleLesson.period == period)
        .group_by(
            ScheduleLesson.teacher_id,
            ScheduleLesson.day_of_week,
            ScheduleLesson.start_time,
            ScheduleLesson.end_time,
        )
        .having(func.count(ScheduleLesson.id) > 1)
        .all()
    )
    combined_slots = set(combined_rows)

    return [_serialize_lesson(item, combined_slots=combined_slots) for item in lessons]


@router.post("/lessons", response_model=ScheduleLessonOut)
def create_lesson(
    data: ScheduleLessonPayload,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    school_class = _get_school_class_or_404(db, data.class_id)
    teacher = _get_teacher_or_404(db, data.teacher_id)

    _check_lesson_conflicts(
        db,
        school_class=school_class,
        day_of_week=data.day_of_week,
        lesson_number=data.lesson_number,
        subject=data.subject,
        start_time=data.start_time,
        end_time=data.end_time,
        teacher=teacher,
        period=data.period,
        allow_combined=data.allow_combined,
    )

    lesson = ScheduleLesson(
        class_id=school_class.id,
        day_of_week=data.day_of_week,
        lesson_number=data.lesson_number,
        subject=data.subject,
        start_time=data.start_time,
        end_time=data.end_time,
        room=data.room,
        teacher_id=teacher.id if teacher else None,
        period=data.period,
        sort_order=data.sort_order if data.sort_order > 0 else data.lesson_number,
    )
    db.add(lesson)
    db.commit()

    created = (
        db.query(ScheduleLesson)
        .options(
            joinedload(ScheduleLesson.school_class),
            joinedload(ScheduleLesson.teacher),
        )
        .filter(ScheduleLesson.id == lesson.id)
        .first()
    )
    return _serialize_lesson(created, db=db)


@router.put("/lessons/{lesson_id}", response_model=ScheduleLessonOut)
def update_lesson(
    lesson_id: int,
    data: ScheduleLessonPayload,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    lesson = db.query(ScheduleLesson).filter(ScheduleLesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")

    school_class = _get_school_class_or_404(db, data.class_id)
    teacher = _get_teacher_or_404(db, data.teacher_id)

    _check_lesson_conflicts(
        db,
        school_class=school_class,
        day_of_week=data.day_of_week,
        lesson_number=data.lesson_number,
        subject=data.subject,
        start_time=data.start_time,
        end_time=data.end_time,
        teacher=teacher,
        period=data.period,
        exclude_lesson_ids={lesson_id},
        allow_combined=data.allow_combined,
    )

    lesson.class_id = school_class.id
    lesson.day_of_week = data.day_of_week
    lesson.lesson_number = data.lesson_number
    lesson.subject = data.subject
    lesson.start_time = data.start_time
    lesson.end_time = data.end_time
    lesson.room = data.room
    lesson.teacher_id = teacher.id if teacher else None
    lesson.period = data.period
    lesson.sort_order = data.sort_order if data.sort_order > 0 else data.lesson_number

    db.commit()

    updated = (
        db.query(ScheduleLesson)
        .options(
            joinedload(ScheduleLesson.school_class),
            joinedload(ScheduleLesson.teacher),
        )
        .filter(ScheduleLesson.id == lesson_id)
        .first()
    )
    return _serialize_lesson(updated, db=db)


@router.patch("/reorder")
def reorder_lessons(
    payload: ScheduleReorderRequest,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    item_map = {item.id: item for item in payload.items}
    lessons = (
        db.query(ScheduleLesson)
        .options(
            joinedload(ScheduleLesson.school_class),
            joinedload(ScheduleLesson.teacher),
        )
        .filter(ScheduleLesson.id.in_(item_map.keys()))
        .all()
    )

    if len(lessons) != len(item_map):
        raise HTTPException(status_code=404, detail="Некоторые уроки не найдены")

    contexts = {(l.class_id, l.day_of_week, l.period) for l in lessons}
    if len(contexts) != 1:
        raise HTTPException(
            status_code=400,
            detail="Перестановка порядка допускается только внутри одного класса и дня",
        )

    class_id, day_of_week, period = next(iter(contexts))
    school_class = lessons[0].school_class

    # Validate internal consistency among the reordered set
    seen_numbers: set[int] = set()
    planned_slots: list[tuple[str, str, int]] = []
    for item in payload.items:
        if item.lesson_number in seen_numbers:
            raise HTTPException(
                status_code=409,
                detail=f"Повторяющийся номер урока при перестановке: {item.lesson_number}",
            )
        seen_numbers.add(item.lesson_number)
        for prev_start, prev_end, prev_num in planned_slots:
            if _times_overlap(item.start_time, item.end_time, prev_start, prev_end):
                raise HTTPException(
                    status_code=409,
                    detail=(
                        f"Пересечение времени между уроками №{prev_num} ({prev_start}–{prev_end}) "
                        f"и №{item.lesson_number} ({item.start_time}–{item.end_time})."
                    ),
                )
        planned_slots.append((item.start_time, item.end_time, item.lesson_number))

    excluded_ids = set(item_map.keys())
    for lesson in lessons:
        patch_data = item_map[lesson.id]
        _check_lesson_conflicts(
            db,
            school_class=school_class,
            day_of_week=day_of_week,
            lesson_number=patch_data.lesson_number,
            subject=lesson.subject,
            start_time=patch_data.start_time,
            end_time=patch_data.end_time,
            teacher=lesson.teacher,
            period=period,
            exclude_lesson_ids=excluded_ids,
        )

    for lesson in lessons:
        patch_data = item_map[lesson.id]
        lesson.lesson_number = patch_data.lesson_number
        lesson.start_time = patch_data.start_time
        lesson.end_time = patch_data.end_time
        lesson.sort_order = patch_data.sort_order

    db.commit()
    return {"message": "Порядок уроков обновлён"}


@router.delete("/lessons/{lesson_id}")
def delete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    lesson = db.query(ScheduleLesson).filter(ScheduleLesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Урок не найден")

    db.delete(lesson)
    db.commit()
    return {"message": "Урок удалён", "id": lesson_id}


@router.delete("/clear")
def clear_schedule(
    class_id: int = Query(gt=0),
    day_of_week: str | None = Query(default=None),
    period: str = Query(default="main"),
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    school_class = _get_school_class_or_404(db, class_id)
    query = db.query(ScheduleLesson).filter(
        ScheduleLesson.class_id == school_class.id,
        ScheduleLesson.period == period,
    )
    if day_of_week is not None:
        cleaned_day = day_of_week.strip().lower()
        if cleaned_day not in SCHEDULE_DAYS:
            raise HTTPException(status_code=400, detail="Некорректный день недели")
        query = query.filter(ScheduleLesson.day_of_week == cleaned_day)

    deleted_count = query.delete(synchronize_session=False)
    db.commit()
    return {
        "message": "Расписание очищено",
        "deleted_count": deleted_count,
        "class_id": school_class.id,
        "day_of_week": day_of_week,
    }


def _copy_lessons_into_target(
    db: Session,
    *,
    source_lessons: list[ScheduleLesson],
    target_class: SchoolClass,
    day_mapper,
    overwrite: bool,
    include_teachers: bool,
    period: str,
    clear_entire_target_class: bool,
    allow_combined: bool = False,
) -> int:
    if not source_lessons:
        raise HTTPException(status_code=400, detail="В выбранном источнике нет уроков для копирования")

    target_days = {day_mapper(l.day_of_week) for l in source_lessons}
    existing_query = db.query(ScheduleLesson).filter(
        ScheduleLesson.class_id == target_class.id,
        ScheduleLesson.period == period,
    )
    if not clear_entire_target_class:
        existing_query = existing_query.filter(ScheduleLesson.day_of_week.in_(target_days))

    existing_lessons = existing_query.all()
    if existing_lessons and not overwrite:
        raise HTTPException(
            status_code=409,
            detail=(
                f"В целевом расписании ({target_class.name}) уже есть {len(existing_lessons)} ур. "
                "Подтвердите перезапись, чтобы заменить существующие уроки."
            ),
        )

    excluded_ids = {l.id for l in existing_lessons} if overwrite else set()

    # Check teacher conflicts across all target lessons before mutating DB
    for src in source_lessons:
        target_day = day_mapper(src.day_of_week)
        teacher = src.teacher if include_teachers else None
        _check_lesson_conflicts(
            db,
            school_class=target_class,
            day_of_week=target_day,
            lesson_number=src.lesson_number,
            subject=src.subject,
            start_time=src.start_time,
            end_time=src.end_time,
            teacher=teacher,
            period=period,
            exclude_lesson_ids=excluded_ids,
            allow_combined=allow_combined,
        )

    if overwrite and existing_lessons:
        for existing_item in existing_lessons:
            db.delete(existing_item)
        db.flush()

    created_count = 0
    for src in source_lessons:
        target_day = day_mapper(src.day_of_week)
        db.add(
            ScheduleLesson(
                class_id=target_class.id,
                day_of_week=target_day,
                lesson_number=src.lesson_number,
                subject=src.subject,
                start_time=src.start_time,
                end_time=src.end_time,
                room=src.room,
                teacher_id=src.teacher_id if include_teachers else None,
                period=period,
                sort_order=src.sort_order,
            )
        )
        created_count += 1

    db.commit()
    return created_count


@router.post("/copy-day")
def copy_day_schedule(
    data: ScheduleCopyDayRequest,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    if data.source_class_id == data.target_class_id and data.source_day == data.target_day:
        raise HTTPException(status_code=400, detail="Исходный и целевой день совпадают")

    source_class = _get_school_class_or_404(db, data.source_class_id)
    target_class = _get_school_class_or_404(db, data.target_class_id)

    source_lessons = (
        db.query(ScheduleLesson)
        .options(joinedload(ScheduleLesson.teacher))
        .filter(
            ScheduleLesson.class_id == source_class.id,
            ScheduleLesson.day_of_week == data.source_day,
            ScheduleLesson.period == data.period,
        )
        .order_by(ScheduleLesson.lesson_number.asc(), ScheduleLesson.id.asc())
        .all()
    )

    copied = _copy_lessons_into_target(
        db,
        source_lessons=source_lessons,
        target_class=target_class,
        day_mapper=lambda _day: data.target_day,
        overwrite=data.overwrite,
        include_teachers=data.include_teachers,
        period=data.period,
        clear_entire_target_class=False,
        allow_combined=data.allow_combined,
    )
    return {
        "message": f"Скопировано уроков: {copied}",
        "copied_count": copied,
    }


@router.post("/copy-class")
def copy_class_schedule(
    data: ScheduleCopyClassRequest,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    if data.source_class_id == data.target_class_id:
        raise HTTPException(status_code=400, detail="Выберите другой целевой класс")

    source_class = _get_school_class_or_404(db, data.source_class_id)
    target_class = _get_school_class_or_404(db, data.target_class_id)

    source_lessons = (
        db.query(ScheduleLesson)
        .options(joinedload(ScheduleLesson.teacher))
        .filter(
            ScheduleLesson.class_id == source_class.id,
            ScheduleLesson.period == data.period,
        )
        .order_by(ScheduleLesson.day_of_week.asc(), ScheduleLesson.lesson_number.asc(), ScheduleLesson.id.asc())
        .all()
    )

    copied = _copy_lessons_into_target(
        db,
        source_lessons=source_lessons,
        target_class=target_class,
        day_mapper=lambda day: day,
        overwrite=data.overwrite,
        include_teachers=data.include_teachers,
        period=data.period,
        clear_entire_target_class=True,
        allow_combined=data.allow_combined,
    )
    return {
        "message": f"Скопировано уроков в класс «{target_class.name}»: {copied}",
        "copied_count": copied,
    }


@router.post("/import/preview")
async def preview_schedule_import(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    filename = file.filename or "schedule.docx"
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Загружен пустой файл")

    try:
        preview_data = parse_schedule_file(content, filename, db)
        return preview_data
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка обработки файла: {str(e)}")


@router.post("/import/apply")
def apply_schedule_import(
    data: ScheduleImportApplyRequest,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf),
):
    if not data.lessons:
        raise HTTPException(status_code=400, detail="Нет уроков для сохранения")

    class_ids = set(data.class_ids) if data.class_ids else {l.class_id for l in data.lessons}
    if not class_ids:
        raise HTTPException(status_code=400, detail="Не указаны классы для обновления")

    # Mode: "all" clears all days for these classes; "days" clears only selected_days
    delete_query = db.query(ScheduleLesson).filter(
        ScheduleLesson.class_id.in_(class_ids),
        ScheduleLesson.period == data.period,
    )
    if data.mode == "days" and data.selected_days:
        delete_query = delete_query.filter(ScheduleLesson.day_of_week.in_(data.selected_days))

    deleted_count = delete_query.delete(synchronize_session=False)

    lessons_to_insert = data.lessons
    if data.mode == "days" and data.selected_days:
        selected_set = set(data.selected_days)
        lessons_to_insert = [l for l in lessons_to_insert if l.day_of_week in selected_set]

    new_objs = []
    for l in lessons_to_insert:
        new_objs.append(
            ScheduleLesson(
                class_id=l.class_id,
                day_of_week=l.day_of_week,
                lesson_number=l.lesson_number,
                subject=l.subject,
                start_time=l.start_time,
                end_time=l.end_time,
                room=l.room,
                teacher_id=l.teacher_id,
                period=l.period or data.period,
                sort_order=l.lesson_number,
            )
        )

    db.add_all(new_objs)
    db.commit()

    return {
        "success": True,
        "message": f"Успешно сохранено уроков: {len(new_objs)} (удалено старых: {deleted_count})",
        "imported_count": len(new_objs),
        "deleted_count": deleted_count,
        "classes_count": len(class_ids),
    }
