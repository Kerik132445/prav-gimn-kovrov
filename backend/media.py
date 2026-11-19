import io
import os
import uuid

from fastapi import HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))
ROOT_UPLOADS_DIR = os.path.join(ROOT_DIR, "uploads")

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 МБ
MAX_DOCUMENT_SIZE = 150 * 1024 * 1024  # 150 МБ (для объемных архивных PDF)

ALLOWED_IMAGE_FORMATS = {
    "JPEG": ".jpg",
    "PNG": ".png",
    "WEBP": ".webp",
}


def write_file_to_storage(subdir: str, filename: str, file_data: bytes) -> str:
    """Save file in backend/uploads and mirror it to root uploads for static hosting / fallback."""
    # 1. Primary backend storage
    target_dir = ensure_upload_subdir(subdir)
    file_path = os.path.join(target_dir, filename)
    with open(file_path, "wb") as buffer:
        buffer.write(file_data)

    # 2. Mirror to project root uploads
    try:
        root_subdir = os.path.join(ROOT_UPLOADS_DIR, subdir)
        os.makedirs(root_subdir, exist_ok=True)
        root_path = os.path.join(root_subdir, filename)
        with open(root_path, "wb") as buffer:
            buffer.write(file_data)
    except Exception:
        pass

    return f"/uploads/{subdir}/{filename}"


def format_file_size(size_in_bytes: int) -> str:
    """Format file size into human-readable Russian string."""
    if size_in_bytes < 1024:
        return f"{size_in_bytes} Б"
    elif size_in_bytes < 1024 * 1024:
        return f"{size_in_bytes / 1024:.1f} КБ"
    else:
        return f"{size_in_bytes / (1024 * 1024):.1f} МБ"


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

    extension = ALLOWED_IMAGE_FORMATS[image_format]
    filename = f"{uuid.uuid4()}{extension}"
    return write_file_to_storage(subdir, filename, file_data)


async def save_validated_document(file: UploadFile, subdir: str = "newspapers") -> tuple[str, str]:
    """Validate uploaded PDF document size/content and save under UUID filename.
    Returns (public_url, human_readable_size).
    """
    file_data = await file.read(MAX_DOCUMENT_SIZE + 1)

    if len(file_data) > MAX_DOCUMENT_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Размер документа не должен превышать 150 МБ",
        )

    if not file_data:
        raise HTTPException(
            status_code=400,
            detail="Файл пустой",
        )

    # Check PDF magic bytes (%PDF-)
    if not file_data.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="Разрешены только документы в формате PDF",
        )

    filename = f"{uuid.uuid4()}.pdf"
    public_url = write_file_to_storage(subdir, filename, file_data)
    formatted_size = format_file_size(len(file_data))
    return public_url, formatted_size


ALLOWED_DOC_EXTENSIONS = {
    ".pdf": "pdf",
    ".docx": "docx",
    ".doc": "doc",
    ".xlsx": "xlsx",
    ".xls": "xls",
    ".zip": "zip",
}


async def save_uploaded_doc_file(file: UploadFile, subdir: str = "documents") -> tuple[str, str, str, str]:
    """Validate uploaded document (PDF, DOCX, DOC, XLSX, XLS, ZIP), save under UUID filename.
    Returns (public_url, formatted_size, file_type, original_filename).
    """
    orig_name = os.path.basename(file.filename or "document.pdf")
    _, ext = os.path.splitext(orig_name)
    ext = ext.lower()

    if ext not in ALLOWED_DOC_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Недопустимый формат файла. Разрешены: {', '.join(ALLOWED_DOC_EXTENSIONS.keys())}",
        )

    file_data = await file.read(MAX_DOCUMENT_SIZE + 1)

    if len(file_data) > MAX_DOCUMENT_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Размер документа не должен превышать 150 МБ",
        )

    if not file_data:
        raise HTTPException(
            status_code=400,
            detail="Файл пустой",
        )

    # Basic magic byte sanity checks
    if ext == ".pdf" and not file_data.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="Файл повреждён или не является корректным PDF")
    elif ext in [".docx", ".xlsx", ".zip"] and not file_data.startswith(b"PK\x03\x04"):
        raise HTTPException(status_code=400, detail="Файл повреждён или не является корректным документом Office/ZIP")
    elif ext in [".doc", ".xls"] and not file_data.startswith(b"\xd0\xcf\x11\xe0"):
        raise HTTPException(status_code=400, detail="Файл повреждён или не является корректным документом MS Office")

    filename = f"{uuid.uuid4()}{ext}"
    public_url = write_file_to_storage(subdir, filename, file_data)
    formatted_size = format_file_size(len(file_data))
    file_type = ALLOWED_DOC_EXTENSIONS[ext]
    return public_url, formatted_size, file_type, orig_name


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
    """Delete a managed upload file if it safely resolves inside backend/uploads or root/uploads."""
    deleted = False
    file_path = resolve_managed_upload_path(public_url, subdir)
    if file_path and os.path.isfile(file_path):
        try:
            os.remove(file_path)
            deleted = True
        except OSError:
            pass

    # Clean from root uploads mirror as well
    if public_url and public_url.startswith("/uploads/"):
        rel = public_url.lstrip("/").replace("/", os.sep)
        root_candidate = os.path.realpath(os.path.join(ROOT_DIR, rel))
        root_scope = os.path.realpath(os.path.join(ROOT_UPLOADS_DIR, subdir) if subdir else ROOT_UPLOADS_DIR)
        if (root_candidate == root_scope or root_candidate.startswith(root_scope + os.sep)) and os.path.isfile(root_candidate):
            try:
                os.remove(root_candidate)
                deleted = True
            except OSError:
                pass

    return deleted
