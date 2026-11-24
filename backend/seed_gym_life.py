import os
import re
import sys
from bs4 import BeautifulSoup

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import CampShift, NewspaperIssue, TheatrePlay

HTML_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "life.html")


def seed_newspapers(db):
    if db.query(NewspaperIssue).count() > 0:
        print(f"Newspapers already seeded ({db.query(NewspaperIssue).count()} issues).")
        return

    with open(HTML_PATH, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")

    grid = soup.find(id="newspaper-grid")
    if not grid:
        print("Error: #newspaper-grid not found in life.html")
        return

    articles = grid.find_all("article", class_="newspaper-card")
    print(f"Found {len(articles)} newspaper articles in life.html")

    for idx, art in enumerate(articles):
        year = art.get("data-year", "2015")
        is_special = "newspaper-card--special" in art.get("class", [])

        # Parse number and tag
        meta_num = art.find(class_="cover-num")
        number = meta_num.get_text(strip=True) if meta_num else f"№ {idx+1}"

        meta_tag = art.find(class_="cover-badge-tag")
        subtitle = meta_tag.get_text(strip=True) if meta_tag else None

        # Title
        title_el = art.find("h4", class_="newspaper-card__title")
        title = title_el.get_text(strip=True) if title_el else number

        # Description
        desc_el = art.find("p", class_="newspaper-card__desc")
        description = desc_el.get_text(strip=True) if desc_el else None

        # Filesize
        filesize_el = art.find(class_="newspaper-card__filesize")
        filesize_text = filesize_el.get_text(strip=True) if filesize_el else None
        if filesize_text:
            filesize = filesize_text.replace("• PDF", "").strip()
        else:
            filesize = "2.5 МБ"

        # File URL
        read_btn = art.find("a", class_="btn-read-issue")
        if not read_btn:
            read_btn = art.find("a", class_="btn-read-pdf")
        if not read_btn:
            read_btn = art.find("a", class_="newspaper-card__cover")

        file_url = read_btn.get("href") if read_btn else "documents/newspaper/Sretenskie_vitrazhi_2023.pdf"

        issue = NewspaperIssue(
            year=year,
            number=number,
            title=title,
            subtitle=subtitle,
            description=description,
            file_url=file_url,
            file_size=filesize,
            is_special=is_special,
            sort_order=idx,
        )
        db.add(issue)

    db.commit()
    print(f"Successfully seeded {db.query(NewspaperIssue).count()} newspaper issues.")


def seed_theatre(db):
    if db.query(TheatrePlay).count() > 0:
        print(f"Theatre plays already seeded ({db.query(TheatrePlay).count()} plays).")
        return

    initial_plays = [
        {
            "title": "«Принцесса Кру»",
            "author_or_director": "Андреева М. В.",
            "year": "2021",
            "awards": "Лауреат городского конкурса театральных коллективов",
            "description": "Трогательная история по мотивам повести Фрэнсис Бёрнетт «Маленькая принцесса» о благородстве души, стойкости и вере в добро.",
            "video_url": "https://vk.com/video-178231686_456239100",
            "photo_url": "assets/images/clubs/theater/theater-3.webp",
            "sort_order": 1,
        },
        {
            "title": "«Белый Ангел Москвы»",
            "author_or_director": "Андреева М. В.",
            "year": "2018",
            "awards": "Гран-при епархиального фестиваля православной культуры",
            "description": "Историко-биографическая постановка о жизни, милосердии и духовном подвиге великой княгини преподобномученицы Елисаветы Феодоровны.",
            "video_url": "https://vk.com/video-178231686_456239100",
            "photo_url": "assets/images/clubs/theater/theater-1.webp",
            "sort_order": 2,
        },
        {
            "title": "«Можно спросить Нину?»",
            "author_or_director": "Андреева М. В.",
            "year": "2020",
            "awards": "Диплом I степени фестиваля ко Дню Победы",
            "description": "Спектакль по фантастическому рассказу Кира Булычева о неожиданном телефонном звонке сквозь время из мирной Москвы в блокадный Ленинград 1942 года.",
            "video_url": "https://vk.com/video-178231686_456239100",
            "photo_url": "assets/images/clubs/theater/theater-2.webp",
            "sort_order": 3,
        },
        {
            "title": "«Апрель 45-го»",
            "author_or_director": "Андреева М. В.",
            "year": "2019",
            "awards": "Лауреат конкурса военно-патриотической постановки",
            "description": "Литературно-музыкальная композиция о юности на войне, фронтовой дружбе и долгожданной Великой Победе.",
            "video_url": None,
            "photo_url": "assets/images/clubs/theater/theater-4.webp",
            "sort_order": 4,
        },
        {
            "title": "«Снегурочка»",
            "author_or_director": "Андреева М. В.",
            "year": "2022",
            "awards": "Рождественский гимназический фестиваль",
            "description": "Сказка по мотивам весенней сказки А. Н. Островского, наполненная русским фольклором, песнями и хороводами.",
            "video_url": None,
            "photo_url": "assets/images/clubs/theater/theater-5.webp",
            "sort_order": 5,
        },
    ]

    for p in initial_plays:
        play = TheatrePlay(**p)
        db.add(play)

    db.commit()
    print(f"Successfully seeded {db.query(TheatrePlay).count()} theatre plays.")


def seed_camp(db):
    if db.query(CampShift).count() > 0:
        print(f"Camp shifts already seeded ({db.query(CampShift).count()} shifts).")
        return

    initial_shifts = [
        {
            "year": 2026,
            "title": "Летняя оздоровительная смена 2026: «Солнечный город»",
            "dates": "1 июня — 21 июня 2026 г.",
            "vk_album_url": "https://vk.com/album-178231686_295083175",
            "description": "Предстоящая летняя смена для учащихся 1–8 классов. Прогулки на свежем воздухе, спортивные секции, экскурсионные выезды и сбалансированное трехразовое питание. Идет формирование отрядов.",
            "photo_url": "assets/images/clubs/camp-kids.webp",
            "status": "upcoming",
            "sort_order": 1,
        },
        {
            "year": 2025,
            "title": "Летняя смена 2025: «Дорогами добра и открытий»",
            "dates": "2 июня — 23 июня 2025 г.",
            "vk_album_url": "https://vk.com/album-178231686_295083175",
            "description": "Тематическая смена, посвященная экологии родного края, народным ремеслам, спортивным играм и дружбе. Увлекательные квесты и викторины.",
            "photo_url": "assets/images/clubs/camp-kids.webp",
            "status": "completed",
            "sort_order": 2,
        },
        {
            "year": 2024,
            "title": "Летняя смена 2024: «Тропинками родного края»",
            "dates": "3 июня — 24 июня 2024 г.",
            "vk_album_url": "https://vk.com/album-178231686_295083175",
            "description": "Паломническо-краеведческая смена: знакомство с памятниками Ковровского района, походы, творческие мастерские прикладного искусства.",
            "photo_url": "assets/images/clubs/camp-kids.webp",
            "status": "completed",
            "sort_order": 3,
        },
        {
            "year": 2023,
            "title": "Летняя оздоровительная смена 2023: «Радость лета»",
            "dates": "1 июня — 22 июня 2023 г.",
            "vk_album_url": "https://vk.com/album-178231686_295083175",
            "description": "Большая оздоровительная смена пришкольного лагеря. Мастер-классы, зарядка на свежем воздухе, экскурсии и праздничные концерты.",
            "photo_url": "assets/images/clubs/camp-kids.webp",
            "status": "completed",
            "sort_order": 4,
        },
    ]

    for s in initial_shifts:
        shift = CampShift(**s)
        db.add(shift)

    db.commit()
    print(f"Successfully seeded {db.query(CampShift).count()} camp shifts.")


def main():
    db = SessionLocal()
    try:
        seed_newspapers(db)
        seed_theatre(db)
        seed_camp(db)
    finally:
        db.close()


if __name__ == "__main__":
    main()
