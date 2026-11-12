"""Idempotent seed script migrating initial 1-11 class schedules into SQLite."""

from database import Base, SessionLocal, engine
from models import ScheduleLesson, SchoolClass, Teacher
from schemas import infer_class_grade_and_building

BELL_TIMES_REGULAR = {
    1: ("08:20", "09:00"),
    2: ("09:10", "09:50"),
    3: ("10:00", "10:40"),
    4: ("10:50", "11:30"),
    5: ("11:45", "12:25"),
    6: ("12:40", "13:20"),
    7: ("13:30", "14:10"),
}

BELL_TIMES_THURSDAY = {
    1: ("08:30", "09:10"),
    2: ("09:20", "10:00"),
    3: ("10:10", "10:50"),
    4: ("11:00", "11:40"),
    5: ("11:55", "12:35"),
    6: ("13:15", "13:55"),
    7: ("14:05", "14:45"),
}

BELL_TIMES_SATURDAY = {
    1: ("08:20", "09:00"),
    2: ("09:10", "09:50"),
    3: ("10:00", "10:40"),
    4: ("10:50", "11:30"),
    5: ("11:40", "12:20"),
    6: ("12:30", "13:10"),
    7: ("13:20", "14:00"),
}

PRIMARY_POOL = [
    ("Математика", "Зуйкова", "1"),
    ("Русский язык", "Кузнецова", "2"),
    ("Литературное чтение", "Панина", "3"),
    ("Окружающий мир", "Спиридонова", "4"),
    ("Основы православной веры", "Бунтилов", "1"),
    ("Английский язык", "Четверикова", "7"),
    ("Музыка и хоровое пение", "Федоровых", "Актовый зал"),
    ("Физическая культура", "Андреев", "Спортзал"),
    ("Изобразительное искусство", "Борисенко", "5"),
    ("Технология", "Романова", "6"),
]

SECONDARY_POOL = [
    ("Алгебра", "Коровина", "11"),
    ("Геометрия", "Коровина", "11"),
    ("Русский язык", "Баранова", "14"),
    ("Литература", "Андреева", "15"),
    ("История России", "Шачнев", "12"),
    ("Обществознание", "Шачнев", "12"),
    ("Физика", "Ширягина", "16"),
    ("Химия", "Дмитриева", "17"),
    ("Биология", "Варнина", "18"),
    ("География", "Варнина", "18"),
    ("Информатика", "Ширягина", "Комп. класс"),
    ("Английский язык", "Четверикова", "19"),
    ("Основы православной веры", "Бунтилов", "10"),
    ("Церковнославянский язык", "Козлов", "10"),
    ("Физическая культура", "Андреев", "Спортзал"),
]

DAYS_PRIMARY = ["mon", "tue", "wed", "thu", "fri"]
DAYS_SECONDARY = ["mon", "tue", "wed", "thu", "fri", "sat"]


def get_bell_times(day_code: str, lesson_number: int) -> tuple[str, str]:
    if day_code == "thu":
        return BELL_TIMES_THURSDAY[lesson_number]
    if day_code == "sat":
        return BELL_TIMES_SATURDAY[lesson_number]
    return BELL_TIMES_REGULAR[lesson_number]


def seed_schedule() -> int:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(SchoolClass).count() > 0:
            return 0

        teachers_by_last_name = {
            t.last_name.strip().lower(): t.id
            for t in db.query(Teacher).all()
        }

        created_lessons = 0
        # Track busy teachers per (day_code, start_time, end_time) to avoid teacher collisions
        busy_teacher_slots: set[tuple[str, str, str, int]] = set()

        for class_num in range(1, 12):
            name = str(class_num)
            grade, building = infer_class_grade_and_building(name)
            school_class = SchoolClass(name=name, grade=grade, building=building)
            db.add(school_class)
            db.flush()

            is_primary = building == "spassky"
            pool = PRIMARY_POOL if is_primary else SECONDARY_POOL
            days = DAYS_PRIMARY if is_primary else DAYS_SECONDARY

            for day_idx, day_code in enumerate(days):
                if is_primary:
                    lesson_numbers = [1, 2, 3, 4, 5]
                elif day_code == "sat":
                    count = 4 if class_num == 5 else 5
                    lesson_numbers = list(range(2, 2 + count))
                else:
                    count = 6 if class_num <= 8 else 7
                    lesson_numbers = list(range(1, 1 + count))

                for offset, lesson_num in enumerate(lesson_numbers):
                    start_time, end_time = get_bell_times(day_code, lesson_num)
                    base_idx = (class_num * 7 + day_idx * 5 + offset * 3) % len(pool)

                    chosen = None
                    for probe in range(len(pool)):
                        cand = pool[(base_idx + probe) % len(pool)]
                        cand_teacher_id = teachers_by_last_name.get(cand[1].lower())
                        if cand_teacher_id is None or (
                            day_code,
                            start_time,
                            end_time,
                            cand_teacher_id,
                        ) not in busy_teacher_slots:
                            chosen = (cand[0], cand_teacher_id, cand[2])
                            break

                    if chosen is None:
                        cand = pool[base_idx]
                        chosen = (cand[0], None, cand[2])

                    subject, teacher_id, room = chosen
                    if teacher_id is not None:
                        busy_teacher_slots.add((day_code, start_time, end_time, teacher_id))

                    db.add(
                        ScheduleLesson(
                            class_id=school_class.id,
                            day_of_week=day_code,
                            lesson_number=lesson_num,
                            subject=subject,
                            start_time=start_time,
                            end_time=end_time,
                            room=room,
                            teacher_id=teacher_id,
                            period="main",
                            sort_order=lesson_num,
                        )
                    )
                    created_lessons += 1

        db.commit()
        return created_lessons
    finally:
        db.close()


if __name__ == "__main__":
    count = seed_schedule()
    print(f"Seeded schedule lessons: {count}")
