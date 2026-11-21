import re
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


TEACHER_CATEGORIES = (
    "admins",
    "start_teachers",
    "church",
    "lang",
    "accuracy",
    "naturally",
    "work",
    "other",
)


class NewsCreate(BaseModel):
    title: str
    description: str
    content: str
    category: str
    date: str
    image: str | None = None


def _clean_optional_text(value: str | None, max_len: int, field_label: str) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    if not cleaned:
        return None
    if len(cleaned) > max_len:
        raise ValueError(f"Поле «{field_label}» не должно превышать {max_len} символов")
    return cleaned


def _clean_required_text(value: str, max_len: int, field_label: str) -> str:
    cleaned = (value or "").strip()
    if not cleaned:
        raise ValueError(f"Поле «{field_label}» обязательно для заполнения")
    if len(cleaned) > max_len:
        raise ValueError(f"Поле «{field_label}» не должно превышать {max_len} символов")
    return cleaned


class TeacherPayload(BaseModel):
    last_name: str
    first_name: str
    middle_name: str
    position: str
    category: str = "other"
    classroom_guidance: str | None = None
    experience_years: int | None = None
    qualification: str | None = None
    sort_order: int = 0

    @field_validator("last_name")
    @classmethod
    def validate_last_name(cls, v: str) -> str:
        return _clean_required_text(v, 100, "Фамилия")

    @field_validator("first_name")
    @classmethod
    def validate_first_name(cls, v: str) -> str:
        return _clean_required_text(v, 100, "Имя")

    @field_validator("middle_name")
    @classmethod
    def validate_middle_name(cls, v: str) -> str:
        return _clean_required_text(v, 100, "Отчество")

    @field_validator("position")
    @classmethod
    def validate_position(cls, v: str) -> str:
        return _clean_required_text(v, 255, "Должность")

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        cleaned = (v or "").strip() or "other"
        if cleaned not in TEACHER_CATEGORIES:
            raise ValueError("Некорректная категория преподавателя")
        return cleaned

    @field_validator("classroom_guidance")
    @classmethod
    def validate_classroom_guidance(cls, v: str | None) -> str | None:
        return _clean_optional_text(v, 150, "Классное руководство")

    @field_validator("qualification")
    @classmethod
    def validate_qualification(cls, v: str | None) -> str | None:
        return _clean_optional_text(v, 150, "Квалификационная категория")

    @field_validator("experience_years")
    @classmethod
    def validate_experience_years(cls, v: int | None) -> int | None:
        if v is None:
            return None
        if v < 0 or v > 100:
            raise ValueError("Педагогический стаж должен быть от 0 до 100 лет")
        return v

    @field_validator("sort_order")
    @classmethod
    def validate_sort_order(cls, v: int) -> int:
        if v < 0 or v > 1_000_000:
            raise ValueError("Порядок отображения должен быть от 0 до 1000000")
        return v


class TeacherOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    last_name: str
    first_name: str
    middle_name: str
    photo: str
    position: str
    category: str
    classroom_guidance: str | None = None
    experience_years: int | None = None
    qualification: str | None = None
    sort_order: int = 0


class TeacherReorderItem(BaseModel):
    id: int = Field(gt=0)
    sort_order: int = Field(ge=0, le=1_000_000)


class TeacherReorderRequest(BaseModel):
    items: list[TeacherReorderItem] = Field(min_length=1)


SCHEDULE_DAYS = ("mon", "tue", "wed", "thu", "fri", "sat")
SCHEDULE_BUILDINGS = ("spassky", "pokrovsky")

_TIME_RE = re.compile(r"^([01]?\d|2[0-3]):([0-5]\d)$")


def normalize_time_str(value: str, field_label: str) -> str:
    cleaned = (value or "").strip()
    match = _TIME_RE.match(cleaned)
    if not match:
        raise ValueError(f"Поле «{field_label}» должно быть в формате ЧЧ:ММ")
    hours, minutes = int(match.group(1)), int(match.group(2))
    return f"{hours:02d}:{minutes:02d}"


def infer_class_grade_and_building(name: str, explicit_building: str | None = None) -> tuple[int | None, str]:
    match = re.match(r"^\s*(\d{1,2})", name or "")
    grade = int(match.group(1)) if match else None
    if explicit_building and explicit_building in SCHEDULE_BUILDINGS:
        return grade, explicit_building
    if grade is not None and 1 <= grade <= 4:
        return grade, "spassky"
    return grade, "pokrovsky"


class SchoolClassCreate(BaseModel):
    name: str
    building: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        cleaned = re.sub(r"\s+", " ", (v or "").strip())
        if not cleaned:
            raise ValueError("Укажите название класса (например, 5А)")
        if len(cleaned) > 32:
            raise ValueError("Название класса не должно превышать 32 символов")
        return cleaned

    @field_validator("building")
    @classmethod
    def validate_building(cls, v: str | None) -> str | None:
        if v is None:
            return None
        cleaned = v.strip()
        if not cleaned:
            return None
        if cleaned not in SCHEDULE_BUILDINGS:
            raise ValueError("Некорректный корпус")
        return cleaned


class SchoolClassOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    grade: int | None = None
    building: str
    lessons_count: int = 0


class ScheduleLessonPayload(BaseModel):
    class_id: int = Field(gt=0)
    day_of_week: str
    lesson_number: int = Field(ge=1, le=20)
    subject: str
    start_time: str
    end_time: str
    room: str | None = None
    teacher_id: int | None = Field(default=None, gt=0)
    period: str = "main"
    sort_order: int = Field(default=0, ge=0, le=1_000_000)
    allow_combined: bool = False

    @field_validator("day_of_week")
    @classmethod
    def validate_day(cls, v: str) -> str:
        cleaned = (v or "").strip().lower()
        if cleaned not in SCHEDULE_DAYS:
            raise ValueError("Некорректный день недели")
        return cleaned

    @field_validator("subject")
    @classmethod
    def validate_subject(cls, v: str) -> str:
        return _clean_required_text(v, 150, "Предмет")

    @field_validator("room")
    @classmethod
    def validate_room(cls, v: str | None) -> str | None:
        return _clean_optional_text(v, 64, "Кабинет")

    @field_validator("period")
    @classmethod
    def validate_period(cls, v: str) -> str:
        cleaned = (v or "").strip() or "main"
        if len(cleaned) > 64:
            raise ValueError("Идентификатор периода не должен превышать 64 символов")
        return cleaned

    @field_validator("start_time")
    @classmethod
    def validate_start_time(cls, v: str) -> str:
        return normalize_time_str(v, "Время начала")

    @field_validator("end_time")
    @classmethod
    def validate_end_time(cls, v: str) -> str:
        return normalize_time_str(v, "Время окончания")

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.end_time <= self.start_time:
            raise ValueError("Время окончания урока должно быть позже времени начала")
        return self


class ScheduleLessonOut(BaseModel):
    id: int
    class_id: int
    class_name: str
    building: str
    day_of_week: str
    lesson_number: int
    subject: str
    start_time: str
    end_time: str
    room: str | None = None
    teacher_id: int | None = None
    teacher_name: str | None = None
    teacher_short_name: str | None = None
    period: str = "main"
    sort_order: int = 0
    is_combined: bool = False


class ScheduleCopyDayRequest(BaseModel):
    source_class_id: int = Field(gt=0)
    source_day: str
    target_class_id: int = Field(gt=0)
    target_day: str
    overwrite: bool = False
    include_teachers: bool = True
    allow_combined: bool = False
    period: str = "main"

    @field_validator("source_day", "target_day")
    @classmethod
    def validate_days(cls, v: str) -> str:
        cleaned = (v or "").strip().lower()
        if cleaned not in SCHEDULE_DAYS:
            raise ValueError("Некорректный день недели")
        return cleaned

    @field_validator("period")
    @classmethod
    def validate_period(cls, v: str) -> str:
        return (v or "").strip() or "main"


class ScheduleCopyClassRequest(BaseModel):
    source_class_id: int = Field(gt=0)
    target_class_id: int = Field(gt=0)
    overwrite: bool = False
    include_teachers: bool = True
    allow_combined: bool = False
    period: str = "main"

    @field_validator("period")
    @classmethod
    def validate_period(cls, v: str) -> str:
        return (v or "").strip() or "main"


class ScheduleReorderItem(BaseModel):
    id: int = Field(gt=0)
    lesson_number: int = Field(ge=1, le=20)
    start_time: str
    end_time: str
    sort_order: int = Field(default=0, ge=0, le=1_000_000)

    @field_validator("start_time")
    @classmethod
    def validate_start_time(cls, v: str) -> str:
        return normalize_time_str(v, "Время начала")

    @field_validator("end_time")
    @classmethod
    def validate_end_time(cls, v: str) -> str:
        return normalize_time_str(v, "Время окончания")

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.end_time <= self.start_time:
            raise ValueError("Время окончания урока должно быть позже времени начала")
        return self


class ScheduleReorderRequest(BaseModel):
    items: list[ScheduleReorderItem] = Field(min_length=1)


class ScheduleImportLessonItem(BaseModel):
    class_id: int = Field(gt=0)
    day_of_week: str
    lesson_number: int = Field(ge=1, le=10)
    start_time: str
    end_time: str
    subject: str
    room: str | None = None
    teacher_id: int | None = None
    period: str = "main"


class ScheduleImportApplyRequest(BaseModel):
    lessons: list[ScheduleImportLessonItem]
    mode: str = "all"
    selected_days: list[str] = []
    class_ids: list[int] = []
    period: str = "main"


# =========================================================
# Школьное меню питания
# =========================================================

MENU_AGE_GROUPS = ("spassky", "pokrovsky")
MENU_WEEK_NUMBERS = (1, 2)
MENU_DAYS = (1, 2, 3, 4, 5)
MENU_MEAL_TYPES = ("breakfast", "lunch", "snack")
MENU_DISH_CATEGORIES = (
    "first",
    "second",
    "salad",
    "drink",
    "bakery",
    "fruit",
    "dessert",
    "other",
)


def _validate_age_group_value(value: str) -> str:
    cleaned = (value or "").strip().lower()
    if cleaned not in MENU_AGE_GROUPS:
        raise ValueError("Некорректная возрастная группа (допустимы 1–4 или 5–11 классы)")
    return cleaned


def _validate_meal_type_value(value: str) -> str:
    cleaned = (value or "").strip().lower()
    if cleaned not in MENU_MEAL_TYPES:
        raise ValueError("Некорректный приём пищи")
    return cleaned


def _validate_dish_category_value(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip().lower()
    if not cleaned:
        return None
    if cleaned not in MENU_DISH_CATEGORIES:
        raise ValueError("Некорректная категория блюда")
    return cleaned


class MenuItemPayload(BaseModel):
    age_group: str
    week_number: int = Field(ge=1, le=2)
    day_of_week: int = Field(ge=1, le=5)
    meal_type: str
    dish_category: str | None = None
    name: str
    weight: str | None = None
    description: str | None = None
    composition: str | None = None
    sort_order: int = Field(default=0, ge=0, le=1_000_000)

    @field_validator("age_group")
    @classmethod
    def check_age_group(cls, v: str) -> str:
        return _validate_age_group_value(v)

    @field_validator("meal_type")
    @classmethod
    def check_meal_type(cls, v: str) -> str:
        return _validate_meal_type_value(v)

    @field_validator("dish_category")
    @classmethod
    def check_dish_category(cls, v: str | None) -> str | None:
        return _validate_dish_category_value(v)

    @field_validator("name")
    @classmethod
    def check_name(cls, v: str) -> str:
        return _clean_required_text(v, 200, "Название блюда")

    @field_validator("weight")
    @classmethod
    def check_weight(cls, v: str | None) -> str | None:
        return _clean_optional_text(v, 64, "Выход / вес")

    @field_validator("description")
    @classmethod
    def check_description(cls, v: str | None) -> str | None:
        return _clean_optional_text(v, 500, "Описание")

    @field_validator("composition")
    @classmethod
    def check_composition(cls, v: str | None) -> str | None:
        return _clean_optional_text(v, 500, "Состав")


class MenuItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    age_group: str
    week_number: int
    day_of_week: int
    meal_type: str
    dish_category: str | None = None
    name: str
    weight: str | None = None
    description: str | None = None
    composition: str | None = None
    image: str | None = None
    sort_order: int = 0


class MenuDayMealPayload(BaseModel):
    age_group: str
    week_number: int = Field(ge=1, le=2)
    day_of_week: int = Field(ge=1, le=5)
    meal_type: str
    price: str | None = None
    kbju: str | None = None
    note: str | None = None

    @field_validator("age_group")
    @classmethod
    def check_age_group(cls, v: str) -> str:
        return _validate_age_group_value(v)

    @field_validator("meal_type")
    @classmethod
    def check_meal_type(cls, v: str) -> str:
        return _validate_meal_type_value(v)

    @field_validator("price")
    @classmethod
    def check_price(cls, v: str | None) -> str | None:
        return _clean_optional_text(v, 64, "Стоимость")

    @field_validator("kbju")
    @classmethod
    def check_kbju(cls, v: str | None) -> str | None:
        return _clean_optional_text(v, 128, "Пищевая ценность (КБЖУ)")

    @field_validator("note")
    @classmethod
    def check_note(cls, v: str | None) -> str | None:
        return _clean_optional_text(v, 255, "Примечание")


class MenuDayMealOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    age_group: str
    week_number: int
    day_of_week: int
    meal_type: str
    price: str | None = None
    kbju: str | None = None
    note: str | None = None


class MenuReorderItem(BaseModel):
    id: int = Field(gt=0)
    sort_order: int = Field(ge=0, le=1_000_000)


class MenuReorderRequest(BaseModel):
    items: list[MenuReorderItem] = Field(min_length=1)


class MenuCopyDayRequest(BaseModel):
    source_age_group: str
    source_week: int = Field(ge=1, le=2)
    source_day: int = Field(ge=1, le=5)
    target_age_group: str
    target_week: int = Field(ge=1, le=2)
    target_day: int = Field(ge=1, le=5)
    overwrite: bool = False

    @field_validator("source_age_group", "target_age_group")
    @classmethod
    def check_age_groups(cls, v: str) -> str:
        return _validate_age_group_value(v)


class MenuCopyWeekRequest(BaseModel):
    source_age_group: str
    source_week: int = Field(ge=1, le=2)
    target_age_group: str
    target_week: int = Field(ge=1, le=2)
    overwrite: bool = False

    @field_validator("source_age_group", "target_age_group")
    @classmethod
    def check_age_groups(cls, v: str) -> str:
        return _validate_age_group_value(v)


# =========================================================
# FEEDBACK SCHEMAS
# =========================================================

class FeedbackCreate(BaseModel):
    name: str
    contact: str
    subject: str | None = None
    message: str
    consent: bool = Field(..., description="Согласие на обработку персональных данных (152-ФЗ)")
    source_page: str | None = None
    hp: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        cleaned = _clean_required_text(v, 100, "Ваше имя")
        if len(cleaned) < 2:
            raise ValueError("Имя должно содержать не менее 2 символов")
        return cleaned

    @field_validator("contact")
    @classmethod
    def validate_contact(cls, v: str) -> str:
        cleaned = _clean_required_text(v, 100, "Телефон или Email")
        if "@" in cleaned:
            email_pattern = r"^[\w\.-]+@([\w-]+\.)+[\w-]{2,}$"
            if not re.match(email_pattern, cleaned):
                raise ValueError("Введите корректный адрес электронной почты (например, name@example.ru)")
        else:
            digits = re.sub(r"\D", "", cleaned)
            if len(digits) < 10 or len(digits) > 15:
                raise ValueError("Номер телефона должен содержать от 10 до 15 цифр")
            phone_pattern = r"^(\+?[0-9\s\-\(\)]{10,25})$"
            if not re.match(phone_pattern, cleaned):
                raise ValueError("Введите корректный номер телефона (например, +7 (999) 123-45-67)")
        return cleaned

    @field_validator("subject")
    @classmethod
    def validate_subject(cls, v: str | None) -> str | None:
        if v is None:
            return None
        cleaned = v.strip()
        if not cleaned:
            return None
        if len(cleaned) > 150:
            raise ValueError("Тема обращения не должна превышать 150 символов")
        return cleaned

    @field_validator("source_page")
    @classmethod
    def validate_source_page(cls, v: str | None) -> str | None:
        if v is None:
            return None
        cleaned = v.strip()
        return cleaned[:100] if cleaned else None

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        cleaned = _clean_required_text(v, 3000, "Сообщение")
        if len(cleaned) < 5:
            raise ValueError("Сообщение должно содержать не менее 5 символов")
        return cleaned

    @field_validator("consent")
    @classmethod
    def validate_consent(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Необходимо согласие на обработку персональных данных")
        return v


class FeedbackStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in ("new", "processed"):
            raise ValueError("Статус должен быть 'new' или 'processed'")
        return v


class RostochekEnrollCreate(BaseModel):
    parent_name: str
    child_name: str
    child_age: str
    course: str
    contact: str
    comment: str | None = None
    consent: bool = Field(..., description="Согласие на обработку персональных данных (152-ФЗ)")
    hp: str | None = None

    @field_validator("parent_name")
    @classmethod
    def validate_parent_name(cls, v: str) -> str:
        cleaned = _clean_required_text(v, 100, "Имя родителя")
        if len(cleaned) < 2:
            raise ValueError("Имя родителя должно содержать не менее 2 символов")
        return cleaned

    @field_validator("child_name")
    @classmethod
    def validate_child_name(cls, v: str) -> str:
        cleaned = _clean_required_text(v, 100, "Имя ребёнка")
        if len(cleaned) < 2:
            raise ValueError("Имя ребёнка должно содержать не менее 2 символов")
        return cleaned

    @field_validator("child_age")
    @classmethod
    def validate_child_age(cls, v: str) -> str:
        cleaned = _clean_required_text(v, 50, "Возраст ребёнка")
        return cleaned

    @field_validator("course")
    @classmethod
    def validate_course(cls, v: str) -> str:
        cleaned = _clean_required_text(v, 150, "Направление")
        return cleaned

    @field_validator("contact")
    @classmethod
    def validate_contact(cls, v: str) -> str:
        cleaned = _clean_required_text(v, 100, "Телефон или Email")
        if "@" in cleaned:
            email_pattern = r"^[\w\.-]+@([\w-]+\.)+[\w-]{2,}$"
            if not re.match(email_pattern, cleaned):
                raise ValueError("Введите корректный адрес электронной почты (например, name@example.ru)")
        else:
            digits = re.sub(r"\D", "", cleaned)
            if len(digits) < 10 or len(digits) > 15:
                raise ValueError("Номер телефона должен содержать от 10 до 15 цифр")
            phone_pattern = r"^(\+?[0-9\s\-\(\)]{10,25})$"
            if not re.match(phone_pattern, cleaned):
                raise ValueError("Введите корректный номер телефона (например, +7 (999) 123-45-67)")
        return cleaned

    @field_validator("comment")
    @classmethod
    def validate_comment(cls, v: str | None) -> str | None:
        if v is None:
            return None
        cleaned = v.strip()
        if not cleaned:
            return None
        if len(cleaned) > 2000:
            raise ValueError("Комментарий не должен превышать 2000 символов")
        return cleaned

    @field_validator("consent")
    @classmethod
    def validate_consent(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Необходимо согласие на обработку персональных данных")
        return v


class FeedbackOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    contact: str
    subject: str | None = None
    message: str
    status: str
    source_page: str | None = None
    created_at: datetime


# =========================================================
# ЖИЗНЬ ГИМНАЗИИ: ГАЗЕТЫ, ТЕАТР, ЛЕТНИЙ ЛАГЕРЬ
# =========================================================

class NewspaperOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    year: str
    number: str
    title: str
    subtitle: str | None = None
    description: str | None = None
    file_url: str
    file_size: str | None = None
    is_special: bool = False
    sort_order: int = 0
    created_at: datetime


class NewspaperPayload(BaseModel):
    year: str
    number: str
    title: str
    subtitle: str | None = None
    description: str | None = None
    file_url: str | None = None
    file_size: str | None = None
    is_special: bool = False
    sort_order: int = 0


class TheatrePlayOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    author_or_director: str | None = None
    year: str | None = None
    awards: str | None = None
    description: str | None = None
    video_url: str | None = None
    photo_url: str | None = None
    sort_order: int = 0
    created_at: datetime


class TheatrePlayPayload(BaseModel):
    title: str
    author_or_director: str | None = None
    year: str | None = None
    awards: str | None = None
    description: str | None = None
    video_url: str | None = None
    photo_url: str | None = None
    sort_order: int = 0


class CampShiftOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    year: int
    title: str
    dates: str | None = None
    vk_album_url: str | None = None
    description: str | None = None
    photo_url: str | None = None
    status: str = "completed"
    sort_order: int = 0
    created_at: datetime


class CampShiftPayload(BaseModel):
    year: int
    title: str
    dates: str | None = None
    vk_album_url: str | None = None
    description: str | None = None
    photo_url: str | None = None
    status: str = "completed"
    sort_order: int = 0


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    category_key: str
    category_title: str
    file_url: str
    file_size: str | None = None
    file_type: str = "pdf"
    download_name: str | None = None
    sort_order: int = 0
    created_at: datetime
    updated_at: datetime


class DocumentPayload(BaseModel):
    title: str
    category_key: str
    category_title: str
    file_url: str
    file_size: str | None = None
    file_type: str = "pdf"
    download_name: str | None = None
    sort_order: int = 0


class DocumentReorderItem(BaseModel):
    id: int
    sort_order: int


class DocumentReorderRequest(BaseModel):
    items: list[DocumentReorderItem]



