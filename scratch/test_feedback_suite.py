import sys
import os
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(r"c:\Users\kerik\krytoi_site\backend")
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from main import app
from database import SessionLocal
from models import FeedbackMessage, Admin, AdminSession, News, Teacher, SchoolClass
from routes.auth import hash_session_token, CSRF_COOKIE_NAME, CSRF_HEADER_NAME
from routes.feedback import _ip_timestamps
from email_service import is_smtp_configured, send_feedback_notification_sync

client = TestClient(app)

def run_tests():
    print("==================================================================")
    print("STARTING COMPREHENSIVE DYNAMIC TOPICS FEEDBACK TEST SUITE")
    print("==================================================================")

    db = SessionLocal()

    # 0. Setup test admin user and session
    print("\n--- 0. Setting up test admin session ---")
    admin = db.query(Admin).first()
    if not admin:
        admin = Admin(username="admin", password_hash="dummy_hash")
        db.add(admin)
        db.commit()
        db.refresh(admin)

    session_token = secrets.token_urlsafe(32)
    token_hash = hash_session_token(session_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    admin_session = AdminSession(
        token_hash=token_hash,
        admin_id=admin.id,
        expires_at=expires_at
    )
    db.add(admin_session)
    db.commit()

    csrf_val = secrets.token_urlsafe(32)
    auth_headers = {
        "Cookie": f"admin_session={session_token}; {CSRF_COOKIE_NAME}={csrf_val}",
        CSRF_HEADER_NAME: csrf_val
    }
    auth_cookies_only = {
        "Cookie": f"admin_session={session_token}"
    }

    # 1. Test submission WITH selected theme and source page
    print("\n--- 1. Testing submission WITH selected theme and source page ---")
    _ip_timestamps.clear()
    payload_with_theme = {
        "name": "Наталья Сергеевна Романова",
        "contact": "natalia.romanova@mail.ru",
        "subject": "Запись на собеседование с директором",
        "source_page": "Поступающим",
        "message": "Здравствуйте! Хотели бы записаться на собеседование в 1 класс на удобный четверг в марте.",
        "consent": True
    }
    res = client.post("/api/feedback/", json=payload_with_theme)
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
    data = res.json()
    assert data["ok"] is True
    assert "успешно отправлено" in data["message"]
    id_with_theme = data["id"]

    msg1 = db.query(FeedbackMessage).filter(FeedbackMessage.id == id_with_theme).first()
    assert msg1 is not None
    assert msg1.subject == "Запись на собеседование с директором"
    assert msg1.source_page == "Поступающим"
    print(f"✓ Submission with theme created: id={id_with_theme}, theme='{msg1.subject}', page='{msg1.source_page}'")

    # 2. Test submission WITHOUT theme (subject = None)
    print("\n--- 2. Testing submission WITHOUT theme (subject = None) ---")
    _ip_timestamps.clear()
    payload_without_theme = {
        "name": "Алексей Игоревич Кузнецов",
        "contact": "+7 (915) 880-22-33",
        "subject": None,
        "source_page": "Школьное питание",
        "message": "Добрый день! Подскажите, где можно ознакомиться с сертификатами поставщиков продуктов для столовой?",
        "consent": True
    }
    res = client.post("/api/feedback/", json=payload_without_theme)
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {res.text}"
    id_no_theme = res.json()["id"]

    msg2 = db.query(FeedbackMessage).filter(FeedbackMessage.id == id_no_theme).first()
    assert msg2 is not None
    assert msg2.subject is None, f"Expected None subject, got {msg2.subject}"
    assert msg2.source_page == "Школьное питание"
    print(f"✓ Submission without theme created: id={id_no_theme}, subject=None, page='{msg2.source_page}'")

    # 3. Test submission with empty string theme (subject = "") -> should normalize to None
    print("\n--- 3. Testing submission with empty string theme (subject = '') ---")
    _ip_timestamps.clear()
    payload_empty_theme = {
        "name": "Мария Федоровна",
        "contact": "+7 (920) 999-44-55",
        "subject": "   ",
        "source_page": "Расписание уроков",
        "message": "Вопрос по факультативам по физике для 8 класса.",
        "consent": True
    }
    res = client.post("/api/feedback/", json=payload_empty_theme)
    assert res.status_code == 201
    id_empty_theme = res.json()["id"]

    msg3 = db.query(FeedbackMessage).filter(FeedbackMessage.id == id_empty_theme).first()
    assert msg3 is not None
    assert msg3.subject is None, "Whitespace subject should normalize to None"
    assert msg3.source_page == "Расписание уроков"
    print(f"✓ Submission with empty string normalized to None: id={id_empty_theme}")

    # 4. Honeypot Bot Trap
    print("\n--- 4. Testing Honeypot Bot Trap ---")
    _ip_timestamps.clear()
    initial_count = db.query(FeedbackMessage).count()
    spambot_payload = {
        "name": "Bot Spammer",
        "contact": "spambot@spam.com",
        "subject": "Spam topic",
        "source_page": "Контакты",
        "message": "Click here to buy things right now http://spam.xyz",
        "consent": True,
        "hp": "I am a malicious bot filling invisible fields"
    }
    res = client.post("/api/feedback/", json=spambot_payload)
    assert res.status_code == 201
    assert res.json()["ok"] is True
    after_count = db.query(FeedbackMessage).count()
    assert after_count == initial_count, "Honeypot payload must NOT be written to the database!"
    print("✓ Honeypot correctly trapped spam without DB write.")

    # 5. Validation Rules
    print("\n--- 5. Testing Validation Rules ---")
    _ip_timestamps.clear()
    # Empty Name
    res = client.post("/api/feedback/", json={"name": "", "contact": "user@test.ru", "message": "Текст сообщения", "consent": True})
    assert res.status_code == 422, "Empty name must be rejected"

    # Invalid contact
    res = client.post("/api/feedback/", json={"name": "Иван", "contact": "bad_contact", "message": "Текст сообщения", "consent": True})
    assert res.status_code == 422, "Invalid contact must be rejected"

    # Message too short
    res = client.post("/api/feedback/", json={"name": "Иван", "contact": "user@test.ru", "message": "Hi", "consent": True})
    assert res.status_code == 422, "Message < 5 chars must be rejected"

    # Consent False
    res = client.post("/api/feedback/", json={"name": "Иван", "contact": "user@test.ru", "message": "Текст сообщения", "consent": False})
    assert res.status_code == 422, "Consent == False must be rejected"

    print("✓ All validation rules correctly enforced.")

    # 6. Admin API Protection & Operations
    print("\n--- 6. Testing Admin API Protection & Operations ---")
    # Unauthenticated
    assert client.get("/api/feedback/").status_code == 401
    assert client.get("/api/feedback/stats").status_code == 401
    assert client.get(f"/api/feedback/{id_with_theme}").status_code == 401
    assert client.patch(f"/api/feedback/{id_with_theme}/status", json={"status": "processed"}).status_code == 401
    assert client.delete(f"/api/feedback/{id_with_theme}").status_code == 401

    # CSRF protection check
    assert client.patch(f"/api/feedback/{id_with_theme}/status", json={"status": "processed"}, headers=auth_cookies_only).status_code == 403
    assert client.delete(f"/api/feedback/{id_with_theme}", headers=auth_cookies_only).status_code == 403

    # Authenticated stats
    res = client.get("/api/feedback/stats", headers=auth_headers)
    assert res.status_code == 200
    stats = res.json()
    assert stats["total"] >= 3
    print(f"✓ Feedback stats: total={stats['total']}, new={stats['new']}, processed={stats['processed']}")

    # Authenticated list
    res = client.get("/api/feedback/", headers=auth_headers)
    assert res.status_code == 200
    list_data = res.json()
    items = list_data["items"]
    # Check that items have source_page and subject (or None)
    found_with_theme = next((i for i in items if i["id"] == id_with_theme), None)
    found_no_theme = next((i for i in items if i["id"] == id_no_theme), None)
    assert found_with_theme is not None
    assert found_with_theme["subject"] == "Запись на собеседование с директором"
    assert found_with_theme["source_page"] == "Поступающим"
    assert found_no_theme is not None
    assert found_no_theme["subject"] is None
    assert found_no_theme["source_page"] == "Школьное питание"
    print(f"✓ Items list contains source_page and subject (or None) correctly.")

    # Search by source_page
    res = client.get("/api/feedback/?search=Поступающим", headers=auth_headers)
    assert res.status_code == 200
    search_items = res.json()["items"]
    assert any(i["id"] == id_with_theme for i in search_items), "Search should match source_page"
    print("✓ Search successfully finds items by source_page.")

    # Detail view
    res = client.get(f"/api/feedback/{id_no_theme}", headers=auth_headers)
    assert res.status_code == 200
    detail = res.json()
    assert detail["id"] == id_no_theme
    assert detail["subject"] is None
    assert detail["source_page"] == "Школьное питание"
    print("✓ Detail endpoint returns correct source_page and null subject.")

    # Status toggle
    res = client.patch(f"/api/feedback/{id_no_theme}/status", json={"status": "processed"}, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["item"]["status"] == "processed"

    # Delete
    res = client.delete(f"/api/feedback/{id_empty_theme}", headers=auth_headers)
    assert res.status_code == 200
    print(f"✓ Cleanly deleted test item id={id_empty_theme}")

    # 7. Email Service Notification Formatting
    print("\n--- 7. Testing Email Service Notification Formatting ---")
    sample_payload = {
        "id": 99999,
        "name": "Тестовый Отправитель",
        "contact": "test@gymnasium.ru",
        "subject": None,
        "source_page": "Наши преподаватели",
        "message": "Тестовое сообщение без темы",
        "created_at": "13.11.2026 17:30",
        "ip_address": "127.0.0.1"
    }
    sent = send_feedback_notification_sync(sample_payload)
    print(f"  send_feedback_notification_sync returned: {sent} (failsafe, handled None subject & source_page)")
    print("✓ Email service notification handles None subject & source page safely.")

    # 8. Check Existing Endpoints Regression
    print("\n--- 8. Checking Existing Endpoints Regression ---")
    assert client.get("/api/news/").status_code == 200
    assert client.get("/api/teachers/").status_code == 200
    assert client.get("/api/schedule/classes").status_code == 200
    assert client.get("/api/schedule/").status_code == 200
    assert client.get("/api/menu/").status_code == 200
    assert client.get("/api/menu/summary").status_code == 200
    print("✓ News, Teachers, Schedule, and Menu endpoints all return 200 OK.")

    # 9. Verify All 9 Front-end Pages
    print("\n--- 9. Verifying All 9 Front-end Pages ---")
    pages_to_check = [
        ("index.html", "main"),
        ("apply.html", "apply"),
        ("food.html", "food"),
        ("class_schedule.html", "schedule"),
        ("teachers.html", "teachers"),
        ("documents.html", "documents"),
        ("diary.html", "diary"),
        ("contact.html", "contact"),
        ("life.html", "life")
    ]
    for filename, expected_page in pages_to_check:
        full_path = os.path.join(r"c:\Users\kerik\krytoi_site", filename)
        with open(full_path, "r", encoding="utf-8") as f:
            html = f.read()
        assert f'data-page="{expected_page}"' in html, f"{filename} must have data-page='{expected_page}'"
        assert '<select id="user-theme"' in html, f"{filename} must have <select id='user-theme'>"
        assert 'Не выбрана — задам свой вопрос' in html, f"{filename} must have neutral option"
        assert 'Тема обращения <span class="label-optional">(необязательно)</span>' in html or '(необязательно)' in html, f"{filename} label must be optional"
        assert "feedback.js" in html, f"{filename} must load feedback.js"
        assert "config.js" in html, f"{filename} must load config.js"
        print(f"✓ Page {filename} verified (page key '{expected_page}')")

    print("\n==================================================================")
    print("ALL TESTS PASSED SUCCESSFULLY! (100% OK)")
    print("==================================================================")

if __name__ == "__main__":
    run_tests()
