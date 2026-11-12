import os
import uuid

from routes.auth import require_admin

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    UploadFile,
    File
)

from sqlalchemy.orm import Session

from database import SessionLocal
from models import News, NewsImage
from schemas import NewsCreate

from sanitizer import sanitize_html

from PIL import Image, UnidentifiedImageError

from media import ALLOWED_IMAGE_FORMATS, MAX_IMAGE_SIZE, delete_file_by_url, ensure_upload_subdir, save_validated_image
from routes.auth import require_admin, require_csrf

router = APIRouter(
    prefix="/api/news",
    tags=["News"]
)


def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = ensure_upload_subdir("news")


# =========================================================
# СОЗДАНИЕ НОВОСТИ
# =========================================================

@router.post("/")
def create_news(
    news_data: NewsCreate,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf)
):

    news = News(
        title=news_data.title,
        description=news_data.description,
        content=sanitize_html(news_data.content),
        category=news_data.category,
        date=news_data.date,
        image=news_data.image
    )

    db.add(news)
    db.commit()
    db.refresh(news)

    return news


# =========================================================
# ПОЛУЧИТЬ ВСЕ НОВОСТИ
# =========================================================

@router.get("/")
def get_news(
    db: Session = Depends(get_db)
):

    news = db.query(News).order_by(News.id.desc()).all()

    result = []

    for item in news:

        main_image = item.image

        # Если главной картинки нет,
        # используем первую картинку из галереи
        if not main_image and item.images:

            main_image = item.images[0].image

        result.append({

            "id": item.id,

            "title": item.title,

            "description": item.description,

            "content": item.content,

            "category": item.category,

            "date": item.date,

            "image": main_image,

            "images": [
                image.image
                for image in item.images
            ]
        })

    return result


# =========================================================
# ПОЛУЧИТЬ ОДНУ НОВОСТЬ
# =========================================================

@router.get("/{news_id}")
def get_one_news(
    news_id: int,
    db: Session = Depends(get_db)
):

    news = db.query(News).filter(
        News.id == news_id
    ).first()

    if not news:

        raise HTTPException(
            status_code=404,
            detail="Новость не найдена"
        )

    main_image = news.image

    # Если главной картинки нет,
    # берём первую фотографию из галереи
    if not main_image and news.images:

        main_image = news.images[0].image

    return {

        "id": news.id,

        "title": news.title,

        "description": news.description,

        "content": news.content,

        "category": news.category,

        "date": news.date,

        "image": main_image,

        "images": [
            {
                "id": image.id,
                "image": image.image
            }

            for image in news.images
        ]
    }


# =========================================================
# ОБНОВИТЬ НОВОСТЬ
# =========================================================

@router.put("/{news_id}")
def update_news(
    news_id: int,
    news_data: NewsCreate,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf)
):

    news = db.query(News).filter(
        News.id == news_id
    ).first()

    if not news:

        raise HTTPException(
            status_code=404,
            detail="Новость не найдена"
        )

    news.title = news_data.title
    news.description = news_data.description
    news.content = sanitize_html(news_data.content)
    news.category = news_data.category
    news.date = news_data.date

    if news_data.image is not None:
        news.image = news_data.image

    db.commit()
    db.refresh(news)

    return news

# =========================================================
# ЗАГРУЗИТЬ ФОТОГРАФИЮ
# =========================================================


@router.post("/{news_id}/images")
async def upload_news_image(
    news_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf)
):

    news = db.query(News).filter(
        News.id == news_id
    ).first()

    if not news:

        raise HTTPException(
            status_code=404,
            detail="Новость не найдена"
        )

    image_url = await save_validated_image(file, "news")

    # ========================================
    # Добавляем запись в БД
    # ========================================

    news_image = NewsImage(
        news_id=news_id,
        image=image_url
    )

    db.add(news_image)

    # Первая фотография становится главной

    if not news.image:

        news.image = image_url

    db.commit()

    db.refresh(news_image)

    return {

        "message": "Фотография загружена",

        "image": image_url,

        "image_id": news_image.id
    }

# =========================================================
# ПОЛУЧИТЬ ФОТОГРАФИИ НОВОСТИ
# =========================================================


@router.get("/{news_id}/images")
def get_news_images(
    news_id: int,
    db: Session = Depends(get_db)
):

    news = db.query(News).filter(
        News.id == news_id
    ).first()

    if not news:

        raise HTTPException(
            status_code=404,
            detail="Новость не найдена"
        )

    return [

        {
            "id": image.id,
            "image": image.image
        }

        for image in news.images
    ]

# =========================================================
# СДЕЛАТЬ ФОТОГРАФИЮ ГЛАВНОЙ
# =========================================================


@router.put("/{news_id}/images/{image_id}/main")
def set_main_image(
    news_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf)
):

    news = db.query(News).filter(
        News.id == news_id
    ).first()

    if not news:

        raise HTTPException(
            status_code=404,
            detail="Новость не найдена"
        )

    image = db.query(NewsImage).filter(
        NewsImage.id == image_id,
        NewsImage.news_id == news_id
    ).first()

    if not image:

        raise HTTPException(
            status_code=404,
            detail="Фотография не найдена"
        )

    news.image = image.image

    db.commit()
    db.refresh(news)

    return {
        "message": "Главная фотография изменена",
        "image": news.image
    }

# =========================================================
# УДАЛИТЬ ОДНУ ФОТОГРАФИЮ
# =========================================================


@router.delete("/{news_id}/images/{image_id}")
def delete_news_image(
    news_id: int,
    image_id: int,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf)
):

    image = db.query(NewsImage).filter(
        NewsImage.id == image_id,
        NewsImage.news_id == news_id
    ).first()

    if not image:

        raise HTTPException(
            status_code=404,
            detail="Фотография не найдена"
        )

    news = db.query(News).filter(
        News.id == news_id
    ).first()

    deleted_image_url = image.image

    # Удаляем файл с диска
    if not delete_file_by_url(image.image, subdir="news"):
        file_path = image.image.lstrip("/")
        if os.path.exists(file_path):
            os.remove(file_path)

    # Удаляем запись
    db.delete(image)

    # Если удалили главную фотографию
    if news.image == deleted_image_url:

        remaining_image = db.query(NewsImage).filter(
            NewsImage.news_id == news_id,
            NewsImage.id != image_id
        ).first()

        if remaining_image:

            news.image = remaining_image.image

        else:

            news.image = None

    db.commit()

    return {
        "message": "Фотография удалена",
        "id": image_id,
        "main_image": news.image
    }


# =========================================================
# УДАЛИТЬ НОВОСТЬ
# =========================================================

@router.delete("/{news_id}")
def delete_news(
    news_id: int,
    db: Session = Depends(get_db),
    admin_id: int = Depends(require_admin),
    csrf: None = Depends(require_csrf)
):

    news = db.query(News).filter(
        News.id == news_id
    ).first()

    if not news:

        raise HTTPException(
            status_code=404,
            detail="Новость не найдена"
        )

    # Удаляем физические файлы
    for image in news.images:
        if not delete_file_by_url(image.image, subdir="news"):
            file_path = image.image.lstrip("/")
            if os.path.exists(file_path):
                os.remove(file_path)

    db.delete(news)

    db.commit()

    return {

        "message": "Новость удалена",

        "id": news_id
    }
