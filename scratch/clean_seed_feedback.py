import sys
from pathlib import Path
sys.path.insert(0, r"c:\Users\kerik\krytoi_site\backend")
from database import SessionLocal
from models import FeedbackMessage

db = SessionLocal()
db.query(FeedbackMessage).delete()
db.commit()

sample1 = FeedbackMessage(
    name="Елена Васильевна Морозова",
    contact="+7 (910) 773-45-12",
    subject="Запись на собеседование с директором",
    source_page="Поступающим",
    message="Здравствуйте! Хотели бы записаться на предварительное собеседование для поступления в 1 класс на 2026/2027 учебный год.",
    status="new",
    ip_address="127.0.0.1"
)
sample2 = FeedbackMessage(
    name="Сергей Дмитриевич Воронов",
    contact="s.voronov@mail.ru",
    subject="Оформление диетического/аллергического питания",
    source_page="Школьное питание",
    message="Добрый день. Подскажите, пожалуйста, кому передать медицинскую справку о пищевой аллергии ребенка для составления индивидуального меню?",
    status="processed",
    ip_address="127.0.0.1"
)
sample3 = FeedbackMessage(
    name="Ольга Николаевна Кудрявцева",
    contact="+7 (904) 592-11-88",
    subject=None,
    source_page="Расписание уроков",
    message="Здравствуйте! Подскажите, пожалуйста, где можно ознакомиться с графиком проведения школьных олимпиад во втором полугодии?",
    status="new",
    ip_address="127.0.0.1"
)
db.add_all([sample1, sample2, sample3])
db.commit()

items = db.query(FeedbackMessage).all()
print(f"Total feedback messages in DB: {len(items)}")
for it in items:
    print(f"ID={it.id}, Status={it.status}, Page={it.source_page}, Subject={it.subject}, Name={it.name}")
