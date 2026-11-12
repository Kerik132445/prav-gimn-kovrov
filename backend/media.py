import io
import os
import uuid

from fastapi import HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 МБ

ALLOWED_IMAGE_FORMATS = {
    "JPEG": ".jpg",
    "PNG": ".png",
    "WEBP": ".webp",
}


def ensure_upload_subdir(subdir: str) -> str:
    """Ensure upload subdirectory exists under backend/uploads and return its path."""
    target_dir = os.path.join(UPLOADS_DIR, subdir)
    os.makedirs(target_dir, exist_ok=True)
    return target_dir


async def save_validated_image(file: UploadFile, subdir: str) -> str:
    """Validate uploaded image size/content/format with Pillow and save under UUID filename."""
    file_data = await file.read(MAX_IMAGE_SIZE + 1)

    if len(file_data) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Размер изображения не должен превышать 10 МБ",
        )

    if not file_data:
        raise HTTPException(
            status_code=400,
            detail="Файл пустой",
        )

    try:
        image = Image.open(io.BytesIO(file_data))
        image.verify()
        image_format = image.format
    except (UnidentifiedImageError, OSError):
        raise HTTPException(
            status_code=400,
            detail="Файл не является корректным изображением",
        )

    if image_format not in ALLOWED_IMAGE_FORMATS:
        raise HTTPException(
            status_code=400,
            detail="Разрешены только JPG, PNG и WEBP",
        )

    target_dir = ensure_upload_subdir(subdir)
    extension = ALLOWED_IMAGE_FORMATS[image_format]
    filename = f"{uuid.uuid4()}{extension}"
    file_path = os.path.join(target_dir, filename)

    with open(file_path, "wb") as buffer:
        buffer.write(file_data)

    return f"/uploads/{subdir}/{filename}"


def resolve_managed_upload_path(public_url: str | None, subdir: str | None = None) -> str | None:
    """Return safe filesystem path for URLs inside /uploads/..., or None otherwise."""
    if not public_url:
        return None

    expected_prefix = f"/uploads/{subdir}/" if subdir else "/uploads/"
    if not public_url.startswith(expected_prefix):
        return None

    relative_path = public_url.lstrip("/").replace("/", os.sep)
    candidate_path = os.path.realpath(os.path.join(BASE_DIR, relative_path))
    base_scope = os.path.realpath(os.path.join(UPLOADS_DIR, subdir) if subdir else UPLOADS_DIR)

    if not (candidate_path == base_scope or candidate_path.startswith(base_scope + os.sep)):
        return None

    return candidate_path


def delete_file_by_url(public_url: str | None, subdir: str | None = None) -> bool:
    """Delete a managed upload file if it safely resolves inside backend/uploads."""
    file_path = resolve_managed_upload_path(public_url, subdir)
    if file_path and os.path.isfile(file_path):
        os.remove(file_path)
        return True
    return False
