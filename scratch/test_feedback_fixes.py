import sys
import os
from datetime import datetime, timezone, timedelta

# Ensure backend directory in sys.path
sys.path.insert(0, os.path.abspath("backend"))

from fastapi import Request
from routes.feedback import _resolve_source_page, _format_msk_iso, TOPIC_TO_PAGE, MSK_TZ
from models import FeedbackMessage
from database import SessionLocal

class DummyRequest:
    def __init__(self, headers=None, client_host="127.0.0.1"):
        self.headers = headers or {}
        class Client:
            def __init__(self, host):
                self.host = host
        self.client = Client(client_host)

def test_source_page_resolution():
    print("Testing source page resolution...")
    # 1. Explicit source page
    req = DummyRequest()
    assert _resolve_source_page("Расписание уроков", None, req) == "Расписание уроков"
    assert _resolve_source_page("Школьное питание", "Какая-то тема", req) == "Школьное питание"

    # 2. No source page, but known subject
    assert _resolve_source_page(None, "Освобождение от занятий по семейным обстоятельствам", req) == "Расписание уроков"
    assert _resolve_source_page("", "Оформление диетического/аллергического питания", req) == "Школьное питание"
    assert _resolve_source_page(None, "Запись на собеседование с директором", req) == "Поступающим"
    assert _resolve_source_page(None, "Ошибка авторизации через Госуслуги", req) == "Электронный дневник"
    assert _resolve_source_page(None, "Заказ справки об обучении (для пособий, налоговой, военкомата)", req) == "Документы"

    # 3. No source page, no known subject, but Referer
    req_schedule = DummyRequest(headers={"referer": "http://localhost:8000/class_schedule.html"})
    assert _resolve_source_page(None, None, req_schedule) == "Расписание уроков"
    assert _resolve_source_page("", "Неизвестная тема", req_schedule) == "Расписание уроков"

    req_food = DummyRequest(headers={"referer": "http://localhost:8000/food.html"})
    assert _resolve_source_page(None, None, req_food) == "Школьное питание"

    # 4. Fallback
    req_blank = DummyRequest()
    assert _resolve_source_page(None, None, req_blank) == "Главная страница"
    print("✓ Source page resolution passed!")

def test_timezone_formatting():
    print("Testing MSK timezone formatting...")
    now_msk = datetime.now(MSK_TZ).replace(tzinfo=None)
    iso_str = _format_msk_iso(now_msk)
    assert iso_str is not None
    assert "+03:00" in iso_str
    print(f"Sample MSK ISO string: {iso_str}")
    print("✓ Timezone formatting passed!")

def test_database_feedback_items():
    print("Testing DB items retrieval...")
    db = SessionLocal()
    try:
        row16 = db.query(FeedbackMessage).filter(FeedbackMessage.id == 16).first()
        assert row16 is not None
        assert row16.source_page == "Расписание уроков"
        assert row16.subject == "Освобождение от занятий по семейным обстоятельствам"
        formatted_time = _format_msk_iso(row16.created_at)
        assert formatted_time.startswith("2026-11-13T18:22:51+03:00")
        print(f"Row 16: source_page='{row16.source_page}', created_at='{formatted_time}'")

        row14 = db.query(FeedbackMessage).filter(FeedbackMessage.id == 14).first()
        assert row14 is not None
        assert row14.source_page == "Главная страница"
        formatted_time14 = _format_msk_iso(row14.created_at)
        assert formatted_time14.startswith("2026-11-13T17:50:46+03:00")
        print(f"Row 14: source_page='{row14.source_page}', created_at='{formatted_time14}'")

        row12 = db.query(FeedbackMessage).filter(FeedbackMessage.id == 12).first()
        assert row12 is not None
        assert row12.source_page == "Школьное питание"
        formatted_time12 = _format_msk_iso(row12.created_at)
        assert formatted_time12.startswith("2026-11-13T17:49:06+03:00")
        print(f"Row 12: source_page='{row12.source_page}', created_at='{formatted_time12}'")
    finally:
        db.close()
    print("✓ DB items verified!")

if __name__ == "__main__":
    test_source_page_resolution()
    test_timezone_formatting()
    test_database_feedback_items()
    print("\nALL FEEDBACK FIX TESTS PASSED SUCCESSFULLY!")
