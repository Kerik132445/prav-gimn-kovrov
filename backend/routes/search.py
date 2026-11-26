import os
import posixpath
import re
import time
from html.parser import HTMLParser
from typing import Any
from urllib.parse import quote

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import SessionLocal
from models import (
    CampShift,
    Document,
    MenuItem,
    News,
    NewspaperIssue,
    ScheduleLesson,
    SchoolClass,
    Teacher,
    TheatrePlay,
)

router = APIRouter(prefix="/api/search", tags=["Search"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

ROUTES_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(ROUTES_DIR)
FRONTEND_DIR = os.path.dirname(BACKEND_DIR)

# Кэш индекса статических HTML-страниц (пересобирается раз в 10 минут)
_HTML_INDEX_CACHE: dict[str, Any] = {"timestamp": 0.0, "items": []}
_HTML_CACHE_TTL = 600.0

# Таблица исправления раскладки (EN -> RU)
_EN_TO_RU = str.maketrans(
    "qwertyuiop[]asdfghjkl;'zxcvbnm,.`QWERTYUIOP{}ASDFGHJKL:\"ZXCVBNM<>~",
    "йцукенгшщзхъфывапролджэячсмитьбюёЙЦУКЕНГШЩЗХЪФЫВАПРОЛДЖЭЯЧСМИТЬБЮЁ",
)

# Словарь синонимов и частых пользовательских запросов
_SYNONYMS: dict[str, list[str]] = {
    "директор": ["руководитель", "руководство", "приемная", "контакты", "менеджмент"],
    "руководитель": ["директор", "руководство", "завуч", "администрация"],
    "завуч": ["руководство", "администрация", "контакты", "учительская"],
    "столовая": ["питание", "меню", "еда", "обед", "завтрак", "буфет", "кормят"],
    "еда": ["питание", "меню", "столовая", "обед", "завтрак"],
    "обед": ["питание", "меню", "столовая"],
    "завтрак": ["питание", "меню", "столовая"],
    "поступить": ["поступающим", "прием", "заявление", "зачисление", "собеседование"],
    "поступление": ["поступающим", "прием", "заявление", "зачисление", "вакантные"],
    "прием": ["поступающим", "заявление", "зачисление", "документы"],
    "заявление": ["поступающим", "обратная связь", "прием"],
    "уроки": ["расписание", "занятия", "звонки", "класс"],
    "звонки": ["расписание", "режим", "уроки"],
    "занятия": ["расписание", "уроки", "кружки"],
    "оценки": ["дневник", "электронный дневник", "успеваемость", "журнал"],
    "журнал": ["дневник", "электронный дневник", "оценки"],
    "деньги": ["оплата", "платные", "пожертвования", "реквизиты", "помощь", "сбп"],
    "оплата": ["платные", "пожертвования", "реквизиты", "стоимость", "сбп"],
    "стоимость": ["платные", "оплата", "цена", "питание"],
    "помощь": ["пожертвования", "благотворительность", "реквизиты", "сбп"],
    "реквизиты": ["пожертвования", "оплата", "сбп", "общие сведения"],
    "бумаги": ["документы", "устав", "лицензия", "положение", "приказ"],
    "устав": ["документы", "учредительные"],
    "лицензия": ["документы", "реестр", "образование"],
    "аккредитация": ["документы", "свидетельство"],
    "педагог": ["учитель", "учителя", "преподаватель", "состав", "кафедра"],
    "преподаватель": ["учитель", "учителя", "педагог", "состав"],
    "классный": ["учителя", "руководство", "класс"],
    "газета": ["доброе слово", "сми", "выпуск", "жизнь гимназии"],
    "театр": ["встреча", "спектакль", "сцена", "жизнь гимназии"],
    "спектакль": ["театр", "встреча", "жизнь гимназии"],
    "лагерь": ["смена", "лето", "отдых", "жизнь гимназии"],
    "адрес": ["контакты", "корпус", "подлесная", "проезд", "карта"],
    "телефон": ["контакты", "позвонить", "приемная"],
    "почта": ["контакты", "email", "написать"],
    "садик": ["росточек", "дошкольное", "подготовка"],
    "дошкольное": ["росточек", "подготовка"],
    "фгос": ["стандарты", "образовательные стандарты", "образование"],
    "стандарты": ["фгос", "образовательные стандарты"],
    "вакансии": ["вакантные места", "прием", "работа"],
    "льготы": ["стипендии", "поддержка", "социальная"],
    "справка": ["документы", "контакты", "приемная"],
    "календарь": ["праздники", "православный", "события"],
}

_RUS_SUFFIXES = (
    "иями", "ями", "ами", "иям", "ием", "иях", "ость", "ение", "ание",
    "ого", "его", "ому", "ему", "ыми", "ими", "ая", "яя", "ое", "ее",
    "ие", "ые", "ов", "ев", "ей", "ам", "ям", "ах", "ях", "ом", "ем",
    "ую", "юю", "ий", "ый", "ой", "а", "я", "о", "е", "и", "ы", "у", "ю", "ь",
)

_TYPE_LABELS = {
    "page": "Страница",
    "sveden": "Сведения",
    "document": "Документ",
    "news": "Новость",
    "teacher": "Учитель",
    "life": "Жизнь гимназии",
    "schedule": "Расписание",
    "menu": "Питание",
}


def normalize_text(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", (text or "").lower().replace("ё", "е")).strip()
    return cleaned


def stem_word(word: str) -> str:
    w = normalize_text(word)
    if len(w) <= 3:
        return w
    for suffix in _RUS_SUFFIXES:
        if w.endswith(suffix) and len(w) - len(suffix) >= 3:
            return w[: -len(suffix)]
    return w


def tokenize(text: str) -> list[str]:
    return [t for t in re.findall(r"[a-zа-я0-9]+", normalize_text(text)) if len(t) >= 2]


def fix_keyboard_layout(query: str) -> str | None:
    has_latin = bool(re.search(r"[a-zA-Z]", query))
    has_cyrillic = bool(re.search(r"[а-яА-ЯёЁ]", query))
    if has_latin and not has_cyrillic:
        converted = query.translate(_EN_TO_RU)
        if converted != query:
            return converted
    return None


def strip_html_tags(html_text: str) -> str:
    text = re.sub(r"<[^>]+>", " ", html_text or "")
    return re.sub(r"\s+", " ", text).strip()


class _MainContentHTMLParser(HTMLParser):
    """Извлекает заголовок, описание, заголовки секций с id, ссылки и основной текст без header/nav/footer."""

    SKIP_TAGS = {"header", "nav", "footer", "script", "style", "noscript", "svg"}
    HEADING_TAGS = {"h1", "h2", "h3"}

    def __init__(self) -> None:
        super().__init__()
        self.skip_depth = 0
        self.in_main = False
        self.main_seen = False
        self.in_title = False
        self.current_heading: dict[str, str] | None = None
        self.current_link: dict[str, str] | None = None

        self.title_parts: list[str] = []
        self.description = ""
        self.h1 = ""
        self.headings: list[dict[str, str]] = []
        self.links: list[dict[str, str]] = []
        self.body_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        attr_dict = {k.lower(): (v or "") for k, v in attrs}

        if tag == "title":
            self.in_title = True
            return

        if tag == "meta" and attr_dict.get("name", "").lower() == "description":
            if not self.description:
                self.description = attr_dict.get("content", "").strip()
            return

        if tag in self.SKIP_TAGS:
            self.skip_depth += 1
            return

        if self.skip_depth > 0:
            return

        if tag == "main":
            self.in_main = True
            self.main_seen = True

        if tag in self.HEADING_TAGS:
            self.current_heading = {
                "tag": tag,
                "id": attr_dict.get("id", "").strip(),
                "text": "",
            }
        elif tag == "a":
            href = attr_dict.get("href", "").strip()
            if href and not href.startswith("#") and not href.startswith("javascript:"):
                self.current_link = {"href": href, "text": ""}

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == "title":
            self.in_title = False
            return

        if tag in self.SKIP_TAGS:
            if self.skip_depth > 0:
                self.skip_depth -= 1
            return

        if self.skip_depth > 0:
            return

        if tag == "main":
            self.in_main = False

        if tag in self.HEADING_TAGS and self.current_heading is not None:
            text = re.sub(r"\s+", " ", self.current_heading["text"]).strip()
            if text:
                if tag == "h1" and not self.h1:
                    self.h1 = text
                self.headings.append(
                    {"tag": tag, "id": self.current_heading["id"], "text": text}
                )
            self.current_heading = None
        elif tag == "a" and self.current_link is not None:
            text = re.sub(r"\s+", " ", self.current_link["text"]).strip()
            if text and len(text) >= 3:
                self.links.append({"href": self.current_link["href"], "text": text})
            self.current_link = None

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data)
            return

        if self.skip_depth > 0:
            return

        if self.current_heading is not None:
            self.current_heading["text"] += data
        if self.current_link is not None:
            self.current_link["text"] += data

        # Если на странице есть <main>, берём текст только из него; иначе из всего body без header/nav/footer
        if self.in_main or not self.main_seen:
            cleaned = data.strip()
            if cleaned:
                self.body_parts.append(cleaned)


def _clean_page_title(raw_title: str, h1: str) -> str:
    if h1:
        return h1
    title = re.sub(r"\s+", " ", raw_title).strip()
    title = re.sub(r"\s*[|—–-]\s*Православная гимназия.*$", "", title, flags=re.IGNORECASE)
    return title or "Страница сайта"


def _build_html_index() -> list[dict[str, Any]]:
    now = time.time()
    if _HTML_INDEX_CACHE["items"] and (now - _HTML_INDEX_CACHE["timestamp"] < _HTML_CACHE_TTL):
        return _HTML_INDEX_CACHE["items"]

    excluded = {"404.html", "offline.html", "search.html"}
    items: list[dict[str, Any]] = []

    scan_dirs = [
        (FRONTEND_DIR, "", "page"),
        (os.path.join(FRONTEND_DIR, "sveden"), "sveden/", "sveden"),
    ]

    for directory, url_prefix, item_type in scan_dirs:
        if not os.path.isdir(directory):
            continue
        for filename in sorted(os.listdir(directory)):
            if not filename.endswith(".html"):
                continue
            if url_prefix == "" and filename in excluded:
                continue

            filepath = os.path.join(directory, filename)
            if not os.path.isfile(filepath):
                continue

            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    raw_html = f.read()
            except OSError:
                continue

            parser = _MainContentHTMLParser()
            parser.feed(raw_html)
            parser.close()

            raw_title = "".join(parser.title_parts)
            title = _clean_page_title(raw_title, parser.h1)
            body_text = re.sub(r"\s+", " ", " ".join(parser.body_parts)).strip()
            url = f"{url_prefix}{filename}"

            normalized_links = []
            for lnk in parser.links:
                href = lnk["href"]
                if not re.match(r"^(https?:|mailto:|tel:|/)", href, re.IGNORECASE):
                    href = posixpath.normpath(posixpath.join(url_prefix, href))
                normalized_links.append({"href": href, "text": lnk["text"]})

            items.append(
                {
                    "id": f"html:{url}",
                    "type": item_type,
                    "title": title,
                    "description": parser.description or "",
                    "body": body_text,
                    "headings": parser.headings,
                    "links": normalized_links,
                    "url": url,
                    "meta": "Сведения об образовательной организации" if item_type == "sveden" else "Раздел сайта",
                }
            )

    _HTML_INDEX_CACHE["timestamp"] = now
    _HTML_INDEX_CACHE["items"] = items
    return items


def _expand_query(query: str) -> tuple[list[str], list[str], list[str]]:
    """Возвращает (слова_запроса, основы_слов, дополнительные_синонимы)."""
    words = tokenize(query)
    stems = [stem_word(w) for w in words]
    synonyms: list[str] = []
    for w in words:
        for key, vals in _SYNONYMS.items():
            if w == key or stem_word(w) == stem_word(key):
                synonyms.extend(vals)
    # Уникализируем синонимы
    seen = set(words)
    unique_synonyms = []
    for s in synonyms:
        ns = normalize_text(s)
        if ns not in seen:
            seen.add(ns)
            unique_synonyms.append(ns)
    return words, stems, unique_synonyms


def _score_candidate(
    norm_query: str,
    words: list[str],
    stems: list[str],
    synonyms: list[str],
    title: str,
    description: str,
    body: str,
    headings: list[dict[str, str]] | None = None,
    links: list[dict[str, str]] | None = None,
) -> tuple[int, str | None, dict[str, str] | None]:
    """Вычисляет релевантность, опциональный якорь заголовка и подходящую ссылку."""
    n_title = normalize_text(title)
    n_desc = normalize_text(description)
    n_body = normalize_text(body)

    title_stems = {stem_word(t) for t in tokenize(title)}
    desc_stems = {stem_word(t) for t in tokenize(description)}
    body_stems = {stem_word(t) for t in tokenize(body)}

    score = 0
    matched_words = 0

    if norm_query and norm_query in n_title:
        score += 120
    elif norm_query and norm_query in n_desc:
        score += 65
    elif norm_query and norm_query in n_body:
        score += 35

    for w, st in zip(words, stems):
        word_hit = False
        if w in n_title or st in title_stems:
            score += 45
            word_hit = True
        elif any(ts.startswith(st) for ts in title_stems if len(st) >= 3):
            score += 30
            word_hit = True

        if w in n_desc or st in desc_stems:
            score += 22
            word_hit = True

        if w in n_body or st in body_stems:
            score += 12
            word_hit = True
        elif any(bs.startswith(st) for bs in body_stems if len(st) >= 4):
            score += 8
            word_hit = True

        if word_hit:
            matched_words += 1

    # Проверяем заголовки секций (чтобы дать точный якорь #id)
    best_anchor: str | None = None
    if headings:
        for h in headings:
            nh = normalize_text(h["text"])
            h_stems = {stem_word(t) for t in tokenize(h["text"])}
            if norm_query in nh or any(w in nh or st in h_stems for w, st in zip(words, stems)):
                score += 25
                if h.get("id") and not best_anchor:
                    best_anchor = h["id"]

    # Проверяем ссылки внутри страницы
    best_link: dict[str, str] | None = None
    if links:
        for lnk in links:
            nl = normalize_text(lnk["text"])
            l_stems = {stem_word(t) for t in tokenize(lnk["text"])}
            if norm_query in nl or any(w in nl or st in l_stems for w, st in zip(words, stems)):
                score += 20
                if not best_link:
                    best_link = lnk

    # Если совпали не все слова запроса, проверяем синонимы по основам слов (чтобы "питание" не матчилось с "воспитание")
    if matched_words == 0 and synonyms:
        syn_hit = False
        for syn in synonyms:
            syn_st = stem_word(syn)
            if syn_st in title_stems:
                score += 75
                syn_hit = True
            elif syn_st in desc_stems:
                score += 25
                syn_hit = True
            elif syn_st in body_stems:
                score += 6
                syn_hit = True
        if not syn_hit:
            return 0, None, None
    elif matched_words == 0:
        return 0, None, None

    # Бонус если совпали ВСЕ слова запроса
    if words and matched_words == len(words):
        score += 40

    return score, best_anchor, best_link


def _make_snippet(text: str, words: list[str], fallback: str = "", max_len: int = 190) -> str:
    clean = re.sub(r"\s+", " ", text or "").strip()
    if not clean:
        return fallback
    lower = normalize_text(clean)
    pos = -1
    for w in words:
        idx = lower.find(w)
        if idx != -1:
            pos = idx
            break
    if pos == -1:
        return (clean[:max_len] + "...") if len(clean) > max_len else clean

    start = max(0, pos - 65)
    end = min(len(clean), start + max_len)
    snippet = clean[start:end].strip()
    if start > 0:
        snippet = "..." + snippet
    if end < len(clean):
        snippet = snippet + "..."
    return snippet


def _run_search_for_query(raw_query: str, db: Session) -> list[dict[str, Any]]:
    norm_q = normalize_text(raw_query)
    words, stems, synonyms = _expand_query(raw_query)
    if not words:
        return []

    results: list[dict[str, Any]] = []

    # 1. Статические страницы и sveden/*
    for page in _build_html_index():
        score, anchor, matched_link = _score_candidate(
            norm_q,
            words,
            stems,
            synonyms,
            page["title"],
            page["description"],
            page["body"],
            page["headings"],
            page["links"],
        )
        if score <= 0:
            continue

        url = f"{page['url']}#{anchor}" if anchor else page["url"]
        snippet = _make_snippet(page["body"], words, page["description"])
        item: dict[str, Any] = {
            "id": page["id"],
            "type": page["type"],
            "type_label": _TYPE_LABELS[page["type"]],
            "title": page["title"],
            "description": page["description"] or snippet,
            "snippet": snippet,
            "url": url,
            "meta": page["meta"],
            "score": score + (10 if page["type"] == "page" else 5),
        }
        if matched_link and matched_link["href"] != page["url"]:
            item["action_url"] = matched_link["href"]
            item["action_label"] = matched_link["text"][:45]
        results.append(item)

    # 2. Документы из БД
    for doc in db.query(Document).all():
        score, _, _ = _score_candidate(
            norm_q,
            words,
            stems,
            synonyms,
            doc.title,
            doc.category_title,
            f"{doc.file_type} {doc.download_name or ''}",
        )
        if score <= 0:
            continue
        meta_parts = [doc.category_title]
        size_str = (doc.file_size or "").strip()
        type_str = (doc.file_type or "").strip().upper()
        if type_str and type_str not in size_str.upper():
            meta_parts.append(type_str)
        if size_str:
            meta_parts.append(size_str)
        results.append(
            {
                "id": f"doc:{doc.id}",
                "type": "document",
                "type_label": _TYPE_LABELS["document"],
                "title": doc.title,
                "description": f"Категория: {doc.category_title}",
                "snippet": f"Официальный документ из раздела «{doc.category_title}»",
                "url": f"documents.html?category={quote(doc.category_key)}&doc={doc.id}&highlight={quote(raw_query)}",
                "action_url": doc.file_url,
                "action_label": f"Открыть {(doc.file_type or 'PDF').upper()}",
                "meta": " • ".join(meta_parts),
                "score": score + 15,
            }
        )

    # 3. Новости из БД
    for news in db.query(News).all():
        clean_content = strip_html_tags(news.content)
        score, _, _ = _score_candidate(
            norm_q,
            words,
            stems,
            synonyms,
            news.title,
            news.description,
            f"{clean_content} {news.category} {news.date}",
        )
        if score <= 0:
            continue
        snippet = _make_snippet(clean_content, words, news.description)
        results.append(
            {
                "id": f"news:{news.id}",
                "type": "news",
                "type_label": _TYPE_LABELS["news"],
                "title": news.title,
                "description": news.description,
                "snippet": snippet,
                "url": f"news.html?id={news.id}",
                "meta": f"{news.date} • {news.category}",
                "score": score,
            }
        )

    # 4. Учителя из БД
    for t in db.query(Teacher).all():
        full_name = f"{t.last_name} {t.first_name} {t.middle_name}".strip()
        extra = " ".join(
            p for p in [t.position, t.classroom_guidance or "", t.qualification or ""] if p
        )
        score, _, _ = _score_candidate(norm_q, words, stems, synonyms, full_name, t.position, extra)
        if score <= 0:
            continue
        meta_parts = [t.position]
        if t.classroom_guidance:
            meta_parts.append(f"Классное руководство: {t.classroom_guidance}")
        if t.experience_years:
            meta_parts.append(f"Стаж: {t.experience_years} лет")
        results.append(
            {
                "id": f"teacher:{t.id}",
                "type": "teacher",
                "type_label": _TYPE_LABELS["teacher"],
                "title": full_name,
                "description": t.position,
                "snippet": " • ".join(meta_parts),
                "url": f"teachers.html?search={quote(t.last_name)}",
                "meta": t.qualification or "Педагогический состав",
                "score": score + 10,
            }
        )

    # 5. Жизнь гимназии: Газета, Театр, Лагерь
    for issue in db.query(NewspaperIssue).all():
        title = f"Газета «Доброе слово»: {issue.title} ({issue.number}, {issue.year})"
        desc = issue.subtitle or issue.description or "Выпуск школьной газеты"
        score, _, _ = _score_candidate(
            norm_q, words, stems, synonyms, title, desc, issue.description or ""
        )
        if score <= 0:
            continue
        results.append(
            {
                "id": f"newspaper:{issue.id}",
                "type": "life",
                "type_label": _TYPE_LABELS["life"],
                "title": title,
                "description": desc,
                "snippet": _make_snippet(issue.description or desc, words, desc),
                "url": "life.html#newspaper",
                "action_url": issue.file_url,
                "action_label": "Читать выпуск (PDF)",
                "meta": f"Школьная газета • {issue.year}",
                "score": score,
            }
        )

    for play in db.query(TheatrePlay).all():
        title = f"Театр «Встреча»: {play.title}"
        desc = play.author_or_director or play.awards or "Постановка школьного театра"
        score, _, _ = _score_candidate(
            norm_q, words, stems, synonyms, title, desc, f"{play.description or ''} {play.awards or ''}"
        )
        if score <= 0:
            continue
        item = {
            "id": f"play:{play.id}",
            "type": "life",
            "type_label": _TYPE_LABELS["life"],
            "title": title,
            "description": desc,
            "snippet": _make_snippet(play.description or desc, words, desc),
            "url": "life.html#theatre",
            "meta": f"Театральная студия • {play.year or ''}".strip(" •"),
            "score": score,
        }
        if play.video_url:
            item["action_url"] = play.video_url
            item["action_label"] = "Смотреть видео"
        results.append(item)

    for shift in db.query(CampShift).all():
        title = f"Школьный лагерь: {shift.title} ({shift.year})"
        desc = shift.dates or "Летний пришкольный лагерь"
        score, _, _ = _score_candidate(
            norm_q, words, stems, synonyms, title, desc, shift.description or ""
        )
        if score <= 0:
            continue
        item = {
            "id": f"camp:{shift.id}",
            "type": "life",
            "type_label": _TYPE_LABELS["life"],
            "title": title,
            "description": desc,
            "snippet": _make_snippet(shift.description or desc, words, desc),
            "url": "life.html#camp",
            "meta": f"Лагерь • {shift.year}",
            "score": score,
        }
        if shift.vk_album_url:
            item["action_url"] = shift.vk_album_url
            item["action_label"] = "Фотоальбом ВК"
        results.append(item)

    # 6. Расписание (группируем по классам, чтобы не заспамить отдельными уроками)
    classes_map = {c.id: c for c in db.query(SchoolClass).all()}
    class_subjects: dict[int, set[str]] = {}
    for lesson in db.query(ScheduleLesson).all():
        class_subjects.setdefault(lesson.class_id, set()).add(lesson.subject)

    for cls_id, cls in classes_map.items():
        subjects_str = ", ".join(sorted(class_subjects.get(cls_id, set())))
        title = f"Расписание уроков — {cls.name}"
        score, _, _ = _score_candidate(
            norm_q, words, stems, synonyms, title, subjects_str, cls.building or ""
        )
        if score <= 0:
            continue
        results.append(
            {
                "id": f"schedule:{cls.id}",
                "type": "schedule",
                "type_label": _TYPE_LABELS["schedule"],
                "title": title,
                "description": f"Предметы: {subjects_str}" if subjects_str else "Актуальное расписание класса",
                "snippet": _make_snippet(subjects_str, words, "Расписание занятий класса"),
                "url": f"class_schedule.html?class={quote(cls.name)}",
                "meta": "Спасский корпус" if cls.building == "spassky" else "Покровский корпус",
                "score": score,
            }
        )

    # 7. Меню питания (по блюдам)
    seen_dishes: set[str] = set()
    for dish in db.query(MenuItem).all():
        dish_key = normalize_text(dish.name)
        if dish_key in seen_dishes:
            continue
        score, _, _ = _score_candidate(
            norm_q,
            words,
            stems,
            synonyms,
            dish.name,
            dish.description or "",
            dish.composition or "",
        )
        if score <= 0:
            continue
        seen_dishes.add(dish_key)
        results.append(
            {
                "id": f"menu:{dish.id}",
                "type": "menu",
                "type_label": _TYPE_LABELS["menu"],
                "title": f"Блюдо в меню: {dish.name}",
                "description": dish.composition or dish.description or "Школьное питание",
                "snippet": _make_snippet(dish.composition or dish.description or dish.name, words),
                "url": "food.html",
                "meta": "Школьное питание",
                "score": score - 5,
            }
        )

    results.sort(key=lambda r: (-r["score"], r["title"]))
    return results


@router.get("")
@router.get("/")
def search_site(
    q: str = Query("", min_length=0, max_length=200),
    type: str = Query("all"),
    limit: int = Query(100, ge=1, le=200),
    db: Session = Depends(get_db),
):
    raw_query = (q or "").strip()
    if len(raw_query) < 2:
        return {
            "query": raw_query,
            "effective_query": raw_query,
            "corrected_from": None,
            "total": 0,
            "counts": {"all": 0},
            "results": [],
        }

    results = _run_search_for_query(raw_query, db)
    effective_query = raw_query
    corrected_from = None

    # Если результатов нет (или совсем мало), пробуем исправить раскладку
    if not results:
        fixed = fix_keyboard_layout(raw_query)
        if fixed:
            fixed_results = _run_search_for_query(fixed, db)
            if fixed_results:
                results = fixed_results
                effective_query = fixed
                corrected_from = raw_query

    counts: dict[str, int] = {"all": len(results)}
    for item in results:
        t = item["type"]
        counts[t] = counts.get(t, 0) + 1

    filtered = results if type == "all" else [r for r in results if r["type"] == type]

    return {
        "query": raw_query,
        "effective_query": effective_query,
        "corrected_from": corrected_from,
        "total": len(results),
        "counts": counts,
        "results": filtered[:limit],
    }
