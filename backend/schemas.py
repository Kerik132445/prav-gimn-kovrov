import re
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


class ScheduleCopyDayRequest(BaseModel):
    source_class_id: int = Field(gt=0)
    source_day: str
    target_class_id: int = Field(gt=0)
    target_day: str
    overwrite: bool = False
    include_teachers: bool = True
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
