import io
import re
import zipfile
import xml.etree.ElementTree as ET
from typing import Any
from sqlalchemy.orm import Session
from models import SchoolClass, Teacher

W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W_NS}

DAY_MAP = {
    "понедельник": "mon",
    "пн": "mon",
    "вторник": "tue",
    "вт": "tue",
    "среда": "wed",
    "ср": "wed",
    "четверг": "thu",
    "чт": "thu",
    "пятница": "fri",
    "пт": "fri",
    "суббота": "sat",
    "сб": "sat",
}

DAY_LABELS = {
    "mon": "Понедельник",
    "tue": "Вторник",
    "wed": "Среда",
    "thu": "Четверг",
    "fri": "Пятница",
    "sat": "Суббота",
}

BELL_SCHEDULE = {
    "regular": {
        1: ("08:20", "09:00"),
        2: ("09:10", "09:50"),
        3: ("10:00", "10:40"),
        4: ("10:50", "11:30"),
        5: ("11:45", "12:25"),
        6: ("12:40", "13:20"),
        7: ("13:30", "14:10"),
        8: ("14:20", "15:00"),
    },
    "thu": {
        1: ("08:30", "09:10"),
        2: ("09:20", "10:00"),
        3: ("10:10", "10:50"),
        4: ("11:00", "11:40"),
        5: ("11:55", "12:35"),
        6: ("13:15", "13:55"),
        7: ("14:05", "14:45"),
        8: ("14:50", "15:30"),
    },
    "sat": {
        1: ("08:20", "09:00"),
        2: ("09:10", "09:50"),
        3: ("10:00", "10:40"),
        4: ("10:50", "11:30"),
        5: ("11:40", "12:20"),
        6: ("12:30", "13:10"),
        7: ("13:20", "14:00"),
    },
}


def get_bell_time(day_of_week: str, lesson_number: int) -> tuple[str, str]:
    schedule_key = "thu" if day_of_week == "thu" else ("sat" if day_of_week == "sat" else "regular")
    day_bells = BELL_SCHEDULE.get(schedule_key, BELL_SCHEDULE["regular"])
    return day_bells.get(lesson_number, ("08:20", "09:00"))


def extract_docx_tables(docx_bytes: bytes) -> list[list[list[str]]]:
    """
    Extracts all tables from a .docx file as 2D string matrices.
    Correctly handles gridSpan (horizontal merge) and vMerge (vertical merge).
    """
    with zipfile.ZipFile(io.BytesIO(docx_bytes)) as z:
        if "word/document.xml" not in z.namelist():
            return []
        xml_content = z.read("word/document.xml")

    root = ET.fromstring(xml_content)
    tables = []

    for tbl in root.findall(".//w:tbl", NS):
        grid = []
        active_vmerges: dict[int, str] = {}

        for tr in tbl.findall("w:tr", NS):
            row_cells: list[str] = []
            col_idx = 0

            for tc in tr.findall("w:tc", NS):
                grid_span_el = tc.find(".//w:gridSpan", NS)
                span = int(grid_span_el.attrib.get(f"{{{W_NS}}}val", 1)) if grid_span_el is not None else 1

                v_merge_el = tc.find(".//w:vMerge", NS)
                v_merge_val = v_merge_el.attrib.get(f"{{{W_NS}}}val") if v_merge_el is not None else None

                paragraphs = []
                for p in tc.findall(".//w:p", NS):
                    p_texts = [t.text for t in p.findall(".//w:t", NS) if t.text]
                    if p_texts:
                        paragraphs.append("".join(p_texts).strip())
                cell_text = "\n".join(paragraphs).strip()

                if v_merge_el is not None:
                    if v_merge_val == "restart":
                        for s in range(span):
                            active_vmerges[col_idx + s] = cell_text
                    else:
                        cell_text = active_vmerges.get(col_idx, cell_text)
                else:
                    for s in range(span):
                        active_vmerges.pop(col_idx + s, None)

                for _ in range(span):
                    row_cells.append(cell_text)
                    col_idx += 1

            if any(cell for cell in row_cells):
                grid.append(row_cells)

        if grid:
            tables.append(grid)

    return tables


def extract_xlsx_tables(xlsx_bytes: bytes) -> list[list[list[str]]]:
    """
    Extracts tables from .xlsx file using openpyxl, populating merged cell values.
    """
    import openpyxl

    wb = openpyxl.load_workbook(io.BytesIO(xlsx_bytes), data_only=True)
    tables = []

    for sheet in wb.worksheets:
        grid: list[list[str]] = []
        max_r = sheet.max_row
        max_c = sheet.max_column

        # Pre-fill grid with cell values
        matrix = [[str(sheet.cell(r, c).value or "").strip() for c in range(1, max_c + 1)] for r in range(1, max_r + 1)]

        # Expand merged ranges so all merged cells have the primary value
        for rng in sheet.merged_cells.ranges:
            top_val = str(sheet.cell(rng.min_row, rng.min_col).value or "").strip()
            for r in range(rng.min_row, rng.max_row + 1):
                for c in range(rng.min_col, rng.max_col + 1):
                    if r <= max_r and c <= max_c:
                        matrix[r - 1][c - 1] = top_val

        # Filter out completely empty rows
        filtered_grid = [row for row in matrix if any(cell for cell in row)]
        if filtered_grid:
            tables.append(filtered_grid)

    return tables


def parse_cell_text(text: str) -> dict[str, str | None] | None:
    """
    Parses cell text into subject, teacher string, and room string.
    Example:
    'Русский язык (Кузнецова С.И.) №6' -> subject='Русский язык', teacher='Кузнецова С.И.', room='№6'
    'КОНЦЕРТ, ПОСВЯЩЕННЫЙ ДНЮ УЧИТЕЛЯ' -> subject='КОНЦЕРТ, ПОСВЯЩЕННЫЙ ДНЮ УЧИТЕЛЯ', teacher=None, room=None
    """
    raw = text.strip()
    if not raw or raw in ("-", "—", "–"):
        return None

    subject = raw
    room = None
    teacher = None

    # 1. Extract Room: e.g. №2/№11, №6, каб. 10
    room_pattern = r"(?:№\s*|каб\.?\s*|кабинет\s*)[0-9]+(?:[\s/]*-?[\s/]*(?:№\s*)?[0-9]+)*"
    room_match = re.search(room_pattern, subject, re.IGNORECASE)
    if room_match:
        room = room_match.group(0).strip()
        subject = subject[: room_match.start()] + " " + subject[room_match.end() :]

    # 2. Extract Teacher in parentheses e.g. (Кузнецова С.И.), (о.Семен), (Илюшина/Дмитриева)
    teacher_match = re.search(r"\(([^)]+)\)", subject)
    if teacher_match:
        teacher = teacher_match.group(1).strip()
        subject = subject[: teacher_match.start()] + " " + subject[teacher_match.end() :]

    # 3. Clean up subject
    subject = re.sub(r"\s+", " ", subject).strip()
    subject = re.sub(r"^[,\s;.-]+", "", subject).strip()
    subject = re.sub(r"[,\s;.-]+$", "", subject).strip()

    if not subject and teacher:
        subject = teacher
        teacher = None

    return {
        "raw": raw,
        "subject": subject,
        "teacher": teacher,
        "room": room,
    }


def find_teacher_in_db(teacher_str: str | None, teachers_cache: list[Teacher]) -> int | None:
    """
    Matches extracted teacher string against the database of teachers.
    Handles initials (Кузнецова С.И.), priest titles (о. Михаил, о.Семен), and surnames.
    """
    if not teacher_str:
        return None

    raw = teacher_str.strip().casefold().replace("ё", "е")

    # 1. Priest match: о. Михаил, о Михаил, отец Михаил, о.Семен
    priest_match = re.search(r"(?:о\.?\s*|отец\s+)([а-яa-z]+)", raw)
    if priest_match:
        p_name = priest_match.group(1).casefold()
        for t in teachers_cache:
            if t.first_name and t.first_name.casefold().replace("ё", "е") == p_name:
                return t.id

    # 2. Surname + initials: e.g. Кузнецова С.И., Шачнев А.В., Ширягина А.В.
    initials_match = re.search(r"([а-яa-z]+)\s+([а-яa-z])\.?\s*([а-яa-z])?\.?", raw)
    if initials_match:
        last_s = initials_match.group(1)
        init_1 = initials_match.group(2)
        init_2 = initials_match.group(3)
        for t in teachers_cache:
            if t.last_name and t.last_name.casefold().replace("ё", "е") == last_s:
                f_ok = (not init_1) or (t.first_name and t.first_name.casefold().replace("ё", "е").startswith(init_1))
                m_ok = (not init_2) or (t.middle_name and t.middle_name.casefold().replace("ё", "е").startswith(init_2))
                if f_ok and m_ok:
                    return t.id

    # 3. Exact surname match (if unambiguous)
    words = re.findall(r"[а-яa-z]+", raw)
    for w in words:
        matches = [t for t in teachers_cache if t.last_name and t.last_name.casefold().replace("ё", "е") == w]
        if len(matches) == 1:
            return matches[0].id

    return None


def parse_schedule_file(
    file_bytes: bytes,
    filename: str,
    db: Session,
) -> dict[str, Any]:
    """
    Parses a schedule file (.docx or .xlsx) and returns structured preview data.
    """
    is_docx = filename.lower().endswith(".docx")
    is_xlsx = filename.lower().endswith(".xlsx")

    if not is_docx and not is_xlsx:
        raise ValueError("Поддерживаются только файлы формата .docx (Word) и .xlsx (Excel).")

    if is_docx:
        tables = extract_docx_tables(file_bytes)
    else:
        tables = extract_xlsx_tables(file_bytes)

    if not tables:
        raise ValueError("В файле не найдено ни одной таблицы с данными.")

    # Load classes and teachers cache from DB
    existing_classes = {c.grade: c for c in db.query(SchoolClass).all()}
    teachers_cache = db.query(Teacher).all()
    teachers_map = {t.id: t for t in teachers_cache}

    parsed_lessons: list[dict[str, Any]] = []
    days_found_set: set[str] = set()
    classes_found_set: set[str] = set()
    warnings: list[str] = []

    for table in tables:
        if len(table) < 2:
            continue

        # Step 1: Detect class header row
        # Look for row containing class names: e.g. "5 класс", "6 класс", "11 класс", "5", "6"
        header_row_idx = -1
        class_col_map: dict[int, SchoolClass] = {}

        for r_idx, row in enumerate(table[:5]):
            found_classes: dict[int, SchoolClass] = {}
            for c_idx, cell in enumerate(row):
                # Search for number of class (1 to 11)
                match = re.search(r"\b([1-9]|1[0-1])(?:\s*[-–]?\s*й)?\s*(?:класс[а-я]*)?\b", cell, re.IGNORECASE)
                if match:
                    grade = int(match.group(1))
                    school_class = existing_classes.get(grade)
                    if school_class:
                        found_classes[c_idx] = school_class

            # If row has at least 2 class columns, we consider it the header row!
            if len(found_classes) >= 2:
                header_row_idx = r_idx
                class_col_map = found_classes
                break

        if header_row_idx == -1 or not class_col_map:
            continue

        # Step 2: Iterate data rows below header
        current_day: str | None = None

        for row in table[header_row_idx + 1 :]:
            # Detect day of week in row
            for cell in row[:3]:
                lowered = cell.strip().casefold()
                for day_key, day_code in DAY_MAP.items():
                    if day_key in lowered:
                        current_day = day_code
                        days_found_set.add(day_code)
                        break

            if not current_day:
                continue

            # Detect lesson number (1 to 8)
            lesson_num = None
            for cell in row[:3]:
                m = re.match(r"^([1-8])\s*$", cell.strip())
                if m:
                    lesson_num = int(m.group(1))
                    break

            if lesson_num is None:
                continue

            start_time, end_time = get_bell_time(current_day, lesson_num)

            # Process each class column
            for col_idx, school_class in class_col_map.items():
                if col_idx >= len(row):
                    continue

                cell_text = row[col_idx]
                parsed_cell = parse_cell_text(cell_text)
                if not parsed_cell:
                    continue

                classes_found_set.add(school_class.name)

                # Teacher matching
                teacher_raw = parsed_cell["teacher"]
                teacher_id = find_teacher_in_db(teacher_raw, teachers_cache)

                teacher_name = None
                if teacher_id and teacher_id in teachers_map:
                    t = teachers_map[teacher_id]
                    teacher_name = f"{t.last_name} {t.first_name[0] if t.first_name else ''}.{t.middle_name[0] if t.middle_name else ''}.".strip()
                elif teacher_raw:
                    teacher_name = teacher_raw
                    # Warning for unmatched teacher
                    w_msg = f"Преподаватель «{teacher_raw}» (класс {school_class.name}, {DAY_LABELS.get(current_day, current_day)}, урок {lesson_num}) не найден в справочнике учителей."
                    if w_msg not in warnings and len(warnings) < 15:
                        warnings.append(w_msg)

                parsed_lessons.append(
                    {
                        "class_id": school_class.id,
                        "class_name": school_class.name,
                        "grade": school_class.grade,
                        "building": school_class.building,
                        "day_of_week": current_day,
                        "day_label": DAY_LABELS.get(current_day, current_day),
                        "lesson_number": lesson_num,
                        "start_time": start_time,
                        "end_time": end_time,
                        "subject": parsed_cell["subject"],
                        "room": parsed_cell["room"],
                        "teacher_id": teacher_id,
                        "teacher_name": teacher_name,
                        "raw_teacher": teacher_raw,
                        "raw_cell": parsed_cell["raw"],
                    }
                )

    if not parsed_lessons:
        raise ValueError(
            "Не удалось распознать уроки. Убедитесь, что в таблице есть заголовок с классами (например, '5 класс', '6 класс') и номера уроков (1–8)."
        )

    # Sort days in standard order
    day_order = ["mon", "tue", "wed", "thu", "fri", "sat"]
    sorted_days = sorted(list(days_found_set), key=lambda d: day_order.index(d) if d in day_order else 99)
    days_found = [{"id": d, "label": DAY_LABELS.get(d, d)} for d in sorted_days]

    # Sort classes
    sorted_classes = sorted(list(classes_found_set), key=lambda c: int(c) if c.isdigit() else 99)

    return {
        "filename": filename,
        "days_found": days_found,
        "classes_found": sorted_classes,
        "total_lessons": len(parsed_lessons),
        "lessons": parsed_lessons,
        "warnings": warnings,
    }
