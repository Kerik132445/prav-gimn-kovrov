import os
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import SessionLocal
from media import delete_file_by_url, ensure_upload_subdir, save_uploaded_doc_file
from models import Document
from routes.auth import require_admin, require_csrf
from schemas import DocumentOut, DocumentReorderRequest

router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)

ensure_upload_subdir("documents")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


STANDARD_CATEGORIES = [
    ("legal", "Правоустанавливающие документы"),
    ("relations", "Образовательные отношения"),
    ("students", "Участники образовательных отношений: Обучающиеся"),
    ("teachers", "Участники образовательных отношений: Работники"),
    ("educational_environment", "Информационная образовательная среда (ЭИОС)"),
    ("acts", "Локальные акты"),
    ("Charity", "Благотворительные средства и добровольные пожертвования"),
]


@router.get("", response_model=list[DocumentOut])
def get_documents(
    category: str | None = Query(None, description="Фильтр по ключу категории"),
    q: str | None = Query(None, description="Поиск по названию документа"),
    db: Session = Depends(get_db),
):
    """Возвращает список документов, отсортированных по категории и порядку."""
    query = db.query(Document)

    if category and category != "all":
        query = query.filter(Document.category_key == category.strip())

    if q and q.strip():
        search_pattern = f"%{q.strip().lower()}%"
        query = query.filter(func.lower(Document.title).like(search_pattern))

    return query.order_by(Document.category_key, Document.sort_order.asc(), Document.id.asc()).all()


@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    """Возвращает список всех существующих категорий с количеством документов."""
    # Group by category in DB
    counts = (
        db.query(Document.category_key, Document.category_title, func.count(Document.id))
        .group_by(Document.category_key, Document.category_title)
        .all()
    )

    db_cats = {c[0]: {"title": c[1], "count": c[2]} for c in counts}

    result = []
    # Preserve standard categories order first
    for key, title in STANDARD_CATEGORIES:
        count = db_cats.get(key, {}).get("count", 0)
        result.append({"key": key, "title": title, "count": count, "is_standard": True})

    # Add any custom categories created by admin
    for key, data in db_cats.items():
        if not any(r["key"] == key for r in result):
            result.append({"key": key, "title": data["title"], "count": data["count"], "is_standard": False})

    return result


@router.post("", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def create_document(
    title: str = Form(..., description="Название документа"),
    category_key: str = Form(..., description="Ключ категории"),
    category_title: str | None = Form(None, description="Отображаемое название категории"),
    file_url: str | None = Form(None, description="Прямая ссылка или путь к файлу"),
    file_size: str | None = Form(None, description="Бейдж размера (например, 2.3 МБ)"),
    file_type: str | None = Form(None, description="Тип файла: pdf, docx, etc."),
    download_name: str | None = Form(None, description="Имя скачиваемого файла"),
    sort_order: int = Form(0, description="Порядковый номер для сортировки"),
    doc_file: UploadFile | None = File(None, description="Загружаемый файл"),
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
    _csrf=Depends(require_csrf),
):
    """Создание нового документа в базе данных."""
    clean_title = title.strip()
    if not clean_title:
        raise HTTPException(status_code=422, detail="Название документа не может быть пустым")

    clean_cat_key = category_key.strip()
    if not clean_cat_key:
        raise HTTPException(status_code=422, detail="Категория документа обязательна")

    # Match or derive category title
    clean_cat_title = category_title.strip() if category_title else ""
    if not clean_cat_title:
        for k, t in STANDARD_CATEGORIES:
            if k == clean_cat_key:
                clean_cat_title = t
                break
        if not clean_cat_title:
            clean_cat_title = clean_cat_key

    final_url = file_url.strip() if file_url else None
    final_size = file_size.strip() if file_size else None
    final_type = (file_type.strip().lower() if file_type else None) or "pdf"
    final_download_name = download_name.strip() if download_name else None

    if doc_file and doc_file.filename:
        uploaded_url, calculated_size, detected_type, orig_filename = await save_uploaded_doc_file(
            doc_file, "documents"
        )
        final_url = uploaded_url
        if not final_size:
            final_size = calculated_size
        final_type = detected_type
        if not final_download_name:
            final_download_name = orig_filename

    if not final_url:
        raise HTTPException(
            status_code=422,
            detail="Необходимо прикрепить файл документа или указать ссылку на него",
        )

    if not final_download_name:
        final_download_name = f"{clean_title}.{final_type}"

    # Auto assign sort_order if default 0: append to end of category
    if sort_order == 0:
        max_order = (
            db.query(func.max(Document.sort_order))
            .filter(Document.category_key == clean_cat_key)
            .scalar()
        )
        sort_order = (max_order or 0) + 1

    new_doc = Document(
        title=clean_title,
        category_key=clean_cat_key,
        category_title=clean_cat_title,
        file_url=final_url,
        file_size=final_size,
        file_type=final_type,
        download_name=final_download_name,
        sort_order=sort_order,
    )

    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    return new_doc


@router.put("/{doc_id}", response_model=DocumentOut)
async def update_document(
    doc_id: int,
    title: str = Form(..., description="Название документа"),
    category_key: str = Form(..., description="Ключ категории"),
    category_title: str | None = Form(None, description="Отображаемое название категории"),
    file_url: str | None = Form(None, description="Прямая ссылка или путь к файлу"),
    file_size: str | None = Form(None, description="Бейдж размера"),
    file_type: str | None = Form(None, description="Тип файла"),
    download_name: str | None = Form(None, description="Имя скачиваемого файла"),
    sort_order: int = Form(0, description="Порядковый номер для сортировки"),
    doc_file: UploadFile | None = File(None, description="Новый файл документа"),
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
    _csrf=Depends(require_csrf),
):
    """Обновление существующего документа."""
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Документ не найден")

    clean_title = title.strip()
    if not clean_title:
        raise HTTPException(status_code=422, detail="Название документа не может быть пустым")

    clean_cat_key = category_key.strip()
    clean_cat_title = category_title.strip() if category_title else ""
    if not clean_cat_title:
        for k, t in STANDARD_CATEGORIES:
            if k == clean_cat_key:
                clean_cat_title = t
                break
        if not clean_cat_title:
            clean_cat_title = clean_cat_key

    doc.title = clean_title
    doc.category_key = clean_cat_key
    doc.category_title = clean_cat_title
    doc.sort_order = sort_order

    if file_size is not None and file_size.strip():
        doc.file_size = file_size.strip()

    if file_type is not None and file_type.strip():
        doc.file_type = file_type.strip().lower()

    if download_name is not None and download_name.strip():
        doc.download_name = download_name.strip()

    if file_url is not None and file_url.strip():
        doc.file_url = file_url.strip()

    if doc_file and doc_file.filename:
        old_file = doc.file_url
        uploaded_url, calculated_size, detected_type, orig_filename = await save_uploaded_doc_file(
            doc_file, "documents"
        )
        doc.file_url = uploaded_url
        doc.file_size = calculated_size
        doc.file_type = detected_type
        if not download_name or not download_name.strip():
            doc.download_name = orig_filename

        if old_file and old_file.startswith("/uploads/documents/"):
            delete_file_by_url(old_file, "documents")

    db.commit()
    db.refresh(doc)
    return doc


@router.delete("/{doc_id}", status_code=status.HTTP_200_OK)
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
    _csrf=Depends(require_csrf),
):
    """Удаление документа и связанного файла."""
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Документ не найден")

    # If file was uploaded to /uploads/documents/, remove it from disk
    if doc.file_url and doc.file_url.startswith("/uploads/documents/"):
        delete_file_by_url(doc.file_url, "documents")

    db.delete(doc)
    db.commit()
    return {"status": "deleted", "id": doc_id}


@router.post("/reorder", status_code=status.HTTP_200_OK)
def reorder_documents(
    payload: DocumentReorderRequest,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
    _csrf=Depends(require_csrf),
):
    """Массовое обновление порядка документов."""
    for item in payload.items:
        db.query(Document).filter(Document.id == item.id).update(
            {"sort_order": item.sort_order}
        )
    db.commit()
    return {"status": "ok", "updated_count": len(payload.items)}
