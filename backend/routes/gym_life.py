import os
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from database import SessionLocal
from media import (
    delete_file_by_url,
    ensure_upload_subdir,
    save_validated_document,
    save_validated_image,
)
from models import CampShift, NewspaperIssue, TheatrePlay
from routes.auth import require_admin, require_csrf
from schemas import (
    CampShiftOut,
    NewspaperOut,
    TheatrePlayOut,
)

router = APIRouter(
    prefix="/api/life",
    tags=["Gymnasium Life"],
)

ensure_upload_subdir("newspapers")
ensure_upload_subdir("theatre")
ensure_upload_subdir("camp")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================================================
# 1. ШКОЛЬНАЯ ГАЗЕТА «ДОБРОЕ СЛОВО»
# =========================================================

@router.get("/newspapers", response_model=list[NewspaperOut])
def get_newspapers(
    year: str | None = Query(None, description="Фильтр по году"),
    db: Session = Depends(get_db),
):
    query = db.query(NewspaperIssue)
    if year and year != "all":
        query = query.filter(NewspaperIssue.year == year)
    # Order by year descending, sort_order ascending, id descending
    issues = query.order_by(
        NewspaperIssue.year.desc(),
        NewspaperIssue.sort_order.asc(),
        NewspaperIssue.id.desc(),
    ).all()
    return issues


@router.get("/newspapers/{issue_id}", response_model=NewspaperOut)
def get_newspaper_by_id(issue_id: int, db: Session = Depends(get_db)):
    issue = db.query(NewspaperIssue).filter(NewspaperIssue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Выпуск газеты не найден")
    return issue


@router.post("/newspapers", response_model=NewspaperOut, status_code=status.HTTP_201_CREATED)
async def create_newspaper(
    year: str = Form(..., description="Год выпуска, например 2024"),
    number: str = Form(..., description="Номер выпуска, например № 1 (2024)"),
    title: str = Form(..., description="Заголовок выпуска"),
    subtitle: str | None = Form(None, description="Подзаголовок / тема номера"),
    description: str | None = Form(None, description="Краткое описание статей"),
    is_special: bool = Form(False, description="Является ли спецвыпуском"),
    sort_order: int = Form(0, description="Порядок сортировки"),
    file_url: str | None = Form(None, description="Прямой URL файла (если не загружается новый)"),
    file_size: str | None = Form(None, description="Размер файла вручную (например 2.5 МБ)"),
    pdf_file: UploadFile | None = File(None, description="PDF файл выпуска"),
    _admin=Depends(require_admin),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    year = year.strip()
    number = number.strip()
    title = title.strip()
    if not year or not number or not title:
        raise HTTPException(status_code=422, detail="Год, номер и заголовок обязательны для заполнения")

    final_file_url = (file_url or "").strip()
    final_file_size = (file_size or "").strip() or None

    if pdf_file and pdf_file.filename:
        uploaded_url, calculated_size = await save_validated_document(pdf_file, "newspapers")
        final_file_url = uploaded_url
        final_file_size = calculated_size

    if not final_file_url:
        raise HTTPException(status_code=422, detail="Необходимо прикрепить PDF файл или указать путь к документу")

    issue = NewspaperIssue(
        year=year,
        number=number,
        title=title,
        subtitle=subtitle.strip() if subtitle else None,
        description=description.strip() if description else None,
        file_url=final_file_url,
        file_size=final_file_size,
        is_special=bool(is_special),
        sort_order=sort_order,
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return issue


@router.put("/newspapers/{issue_id}", response_model=NewspaperOut)
async def update_newspaper(
    issue_id: int,
    year: str = Form(...),
    number: str = Form(...),
    title: str = Form(...),
    subtitle: str | None = Form(None),
    description: str | None = Form(None),
    is_special: bool = Form(False),
    sort_order: int = Form(0),
    file_url: str | None = Form(None),
    file_size: str | None = Form(None),
    pdf_file: UploadFile | None = File(None),
    _admin=Depends(require_admin),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    issue = db.query(NewspaperIssue).filter(NewspaperIssue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Выпуск газеты не найден")

    issue.year = year.strip()
    issue.number = number.strip()
    issue.title = title.strip()
    issue.subtitle = subtitle.strip() if subtitle else None
    issue.description = description.strip() if description else None
    issue.is_special = bool(is_special)
    issue.sort_order = sort_order

    if file_size and file_size.strip():
        issue.file_size = file_size.strip()

    if file_url and file_url.strip():
        issue.file_url = file_url.strip()

    if pdf_file and pdf_file.filename:
        old_file = issue.file_url
        uploaded_url, calculated_size = await save_validated_document(pdf_file, "newspapers")
        issue.file_url = uploaded_url
        issue.file_size = calculated_size
        if old_file and old_file.startswith("/uploads/newspapers/"):
            delete_file_by_url(old_file, "newspapers")

    db.commit()
    db.refresh(issue)
    return issue


@router.delete("/newspapers/{issue_id}", status_code=status.HTTP_200_OK)
def delete_newspaper(
    issue_id: int,
    _admin=Depends(require_admin),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    issue = db.query(NewspaperIssue).filter(NewspaperIssue.id == issue_id).first()
    if not issue:
        raise HTTPException(status_code=404, detail="Выпуск газеты не найден")

    if issue.file_url and issue.file_url.startswith("/uploads/newspapers/"):
        delete_file_by_url(issue.file_url, "newspapers")

    db.delete(issue)
    db.commit()
    return {"message": "Выпуск газеты удалён", "id": issue_id}


# =========================================================
# 2. ТЕАТРАЛЬНАЯ СТУДИЯ «ВСТРЕЧА»
# =========================================================

@router.get("/theatre-plays", response_model=list[TheatrePlayOut])
def get_theatre_plays(db: Session = Depends(get_db)):
    plays = db.query(TheatrePlay).order_by(
        TheatrePlay.sort_order.asc(),
        TheatrePlay.year.desc(),
        TheatrePlay.id.asc(),
    ).all()
    return plays


@router.get("/theatre-plays/{play_id}", response_model=TheatrePlayOut)
def get_theatre_play_by_id(play_id: int, db: Session = Depends(get_db)):
    play = db.query(TheatrePlay).filter(TheatrePlay.id == play_id).first()
    if not play:
        raise HTTPException(status_code=404, detail="Спектакль не найден")
    return play


@router.post("/theatre-plays", response_model=TheatrePlayOut, status_code=status.HTTP_201_CREATED)
async def create_theatre_play(
    title: str = Form(..., description="Название постановки"),
    author_or_director: str | None = Form(None, description="Автор пьесы или режиссер-постановщик"),
    year: str | None = Form(None, description="Год премьеры или сезон"),
    awards: str | None = Form(None, description="Награды, звания, дипломы"),
    description: str | None = Form(None, description="Описание сюжета и постановки"),
    video_url: str | None = Form(None, description="Ссылка на видеозапись (VK Video / YouTube)"),
    photo_url: str | None = Form(None, description="Прямой URL фотографии"),
    sort_order: int = Form(0, description="Порядок отображения"),
    photo_file: UploadFile | None = File(None, description="Файл фотографии / афиши"),
    _admin=Depends(require_admin),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    title = title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Название спектакля обязательно для заполнения")

    final_photo_url = (photo_url or "").strip() or None
    if photo_file and photo_file.filename:
        final_photo_url = await save_validated_image(photo_file, "theatre")

    play = TheatrePlay(
        title=title,
        author_or_director=author_or_director.strip() if author_or_director else None,
        year=year.strip() if year else None,
        awards=awards.strip() if awards else None,
        description=description.strip() if description else None,
        video_url=video_url.strip() if video_url else None,
        photo_url=final_photo_url,
        sort_order=sort_order,
    )
    db.add(play)
    db.commit()
    db.refresh(play)
    return play


@router.put("/theatre-plays/{play_id}", response_model=TheatrePlayOut)
async def update_theatre_play(
    play_id: int,
    title: str = Form(...),
    author_or_director: str | None = Form(None),
    year: str | None = Form(None),
    awards: str | None = Form(None),
    description: str | None = Form(None),
    video_url: str | None = Form(None),
    photo_url: str | None = Form(None),
    sort_order: int = Form(0),
    photo_file: UploadFile | None = File(None),
    _admin=Depends(require_admin),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    play = db.query(TheatrePlay).filter(TheatrePlay.id == play_id).first()
    if not play:
        raise HTTPException(status_code=404, detail="Спектакль не найден")

    play.title = title.strip()
    play.author_or_director = author_or_director.strip() if author_or_director else None
    play.year = year.strip() if year else None
    play.awards = awards.strip() if awards else None
    play.description = description.strip() if description else None
    play.video_url = video_url.strip() if video_url else None
    play.sort_order = sort_order

    if photo_url is not None:
        play.photo_url = photo_url.strip() or None

    if photo_file and photo_file.filename:
        old_photo = play.photo_url
        play.photo_url = await save_validated_image(photo_file, "theatre")
        if old_photo and old_photo.startswith("/uploads/theatre/"):
            delete_file_by_url(old_photo, "theatre")

    db.commit()
    db.refresh(play)
    return play


@router.delete("/theatre-plays/{play_id}", status_code=status.HTTP_200_OK)
def delete_theatre_play(
    play_id: int,
    _admin=Depends(require_admin),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    play = db.query(TheatrePlay).filter(TheatrePlay.id == play_id).first()
    if not play:
        raise HTTPException(status_code=404, detail="Спектакль не найден")

    if play.photo_url and play.photo_url.startswith("/uploads/theatre/"):
        delete_file_by_url(play.photo_url, "theatre")

    db.delete(play)
    db.commit()
    return {"message": "Спектакль удалён", "id": play_id}


# =========================================================
# 3. ЛЕТНИЙ ПРИШКОЛЬНЫЙ ЛАГЕРЬ
# =========================================================

@router.get("/camp-shifts", response_model=list[CampShiftOut])
def get_camp_shifts(db: Session = Depends(get_db)):
    shifts = db.query(CampShift).order_by(
        CampShift.year.desc(),
        CampShift.sort_order.asc(),
        CampShift.id.desc(),
    ).all()
    return shifts


@router.get("/camp-shifts/{shift_id}", response_model=CampShiftOut)
def get_camp_shift_by_id(shift_id: int, db: Session = Depends(get_db)):
    shift = db.query(CampShift).filter(CampShift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Смена лагеря не найдена")
    return shift


@router.post("/camp-shifts", response_model=CampShiftOut, status_code=status.HTTP_201_CREATED)
async def create_camp_shift(
    year: int = Form(..., description="Год проведения смены, например 2024"),
    title: str = Form(..., description="Название смены или девиз"),
    dates: str | None = Form(None, description="Сроки проведения, например 1-21 июня"),
    vk_album_url: str | None = Form(None, description="Ссылка на фотоальбом в VK"),
    description: str | None = Form(None, description="Описание программы смены, мероприятий"),
    status: str = Form("completed", description="upcoming / active / completed"),
    sort_order: int = Form(0, description="Порядок отображения"),
    photo_url: str | None = Form(None, description="Прямой URL фотографии"),
    photo_file: UploadFile | None = File(None, description="Файл фотографии / обложки смены"),
    _admin=Depends(require_admin),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    title = title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Название смены обязательно для заполнения")

    final_photo_url = (photo_url or "").strip() or None
    if photo_file and photo_file.filename:
        final_photo_url = await save_validated_image(photo_file, "camp")

    shift = CampShift(
        year=year,
        title=title,
        dates=dates.strip() if dates else None,
        vk_album_url=vk_album_url.strip() if vk_album_url else None,
        description=description.strip() if description else None,
        photo_url=final_photo_url,
        status=status.strip() if status else "completed",
        sort_order=sort_order,
    )
    db.add(shift)
    db.commit()
    db.refresh(shift)
    return shift


@router.put("/camp-shifts/{shift_id}", response_model=CampShiftOut)
async def update_camp_shift(
    shift_id: int,
    year: int = Form(...),
    title: str = Form(...),
    dates: str | None = Form(None),
    vk_album_url: str | None = Form(None),
    description: str | None = Form(None),
    status: str = Form("completed"),
    sort_order: int = Form(0),
    photo_url: str | None = Form(None),
    photo_file: UploadFile | None = File(None),
    _admin=Depends(require_admin),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    shift = db.query(CampShift).filter(CampShift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Смена лагеря не найдена")

    shift.year = year
    shift.title = title.strip()
    shift.dates = dates.strip() if dates else None
    shift.vk_album_url = vk_album_url.strip() if vk_album_url else None
    shift.description = description.strip() if description else None
    shift.status = status.strip() if status else "completed"
    shift.sort_order = sort_order

    if photo_url is not None:
        shift.photo_url = photo_url.strip() or None

    if photo_file and photo_file.filename:
        old_photo = shift.photo_url
        shift.photo_url = await save_validated_image(photo_file, "camp")
        if old_photo and old_photo.startswith("/uploads/camp/"):
            delete_file_by_url(old_photo, "camp")

    db.commit()
    db.refresh(shift)
    return shift


@router.delete("/camp-shifts/{shift_id}", status_code=status.HTTP_200_OK)
def delete_camp_shift(
    shift_id: int,
    _admin=Depends(require_admin),
    _csrf=Depends(require_csrf),
    db: Session = Depends(get_db),
):
    shift = db.query(CampShift).filter(CampShift.id == shift_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="Смена лагеря не найдена")

    if shift.photo_url and shift.photo_url.startswith("/uploads/camp/"):
        delete_file_by_url(shift.photo_url, "camp")

    db.delete(shift)
    db.commit()
    return {"message": "Смена лагеря удалена", "id": shift_id}
