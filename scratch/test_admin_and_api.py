import os
import sys
from bs4 import BeautifulSoup
from fastapi.testclient import TestClient

sys.path.insert(0, r"c:\Users\kerik\krytoi_site\backend")
from main import app
from database import SessionLocal
from models import Admin, NewspaperIssue, TheatrePlay, CampShift
from auth import hash_password

client = TestClient(app, base_url="https://testserver")

# 1. Verify Admin index.html
with open(r"c:\Users\kerik\krytoi_site\admin\index.html", "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), "html.parser")

tabs = [b.get("data-admin-tab") for b in soup.find_all("button", class_="admin-tab")]
print("Admin main tabs:", tabs)
assert "gym_life" in tabs, "gym_life tab missing in admin tabs!"

subtabs = [b.get("data-life-subtab") for b in soup.find_all("button", class_="gym-life-tab")]
print("Gym life subtabs:", subtabs)
assert "newspapers" in subtabs, "newspapers subtab missing!"
assert "theatre" in subtabs, "theatre subtab missing!"
assert "camp" in subtabs, "camp subtab missing!"

# Verify modals exist
assert soup.find(id="admin-newspaper-modal") is not None, "admin-newspaper-modal missing!"
assert soup.find(id="admin-theatre-modal") is not None, "admin-theatre-modal missing!"
assert soup.find(id="admin-camp-modal") is not None, "admin-camp-modal missing!"

# Verify script tags
scripts = [s.get("src") for s in soup.find_all("script")]
print("Admin scripts:", scripts)
assert any("gym_life.js" in (s or "") for s in scripts), "gym_life.js missing in admin scripts!"

print("HTML check passed successfully!")

# 2. Test Backend API
r_news = client.get("/api/life/newspapers")
assert r_news.status_code == 200
print(f"API Newspapers: {len(r_news.json())} items")

r_theatre = client.get("/api/life/theatre-plays")
assert r_theatre.status_code == 200
print(f"API Theatre: {len(r_theatre.json())} items")

r_camp = client.get("/api/life/camp-shifts")
assert r_camp.status_code == 200
print(f"API Camp: {len(r_camp.json())} items")

# 3. Test Admin Authentication & CRUD
# Ensure admin user exists for test
db = SessionLocal()
admin = db.query(Admin).filter(Admin.username == "testadmin").first()
if not admin:
    admin = Admin(username="testadmin", password_hash=hash_password("admin123"))
    db.add(admin)
    db.commit()
    db.refresh(admin)

login_res = client.post("/api/auth/login", json={"username": "testadmin", "password": "admin123"})
assert login_res.status_code == 200, f"Login failed: {login_res.text}"

csrf_res = client.get("/api/auth/csrf")
csrf_token = csrf_res.json()["csrf_token"]
headers = {"X-CSRF-Token": csrf_token}

# Create a test newspaper issue
create_np = client.post(
    "/api/life/newspapers",
    data={
        "year": "2026",
        "number": "№ 1 (2026)",
        "title": "«Доброе слово» № 1 (2026)",
        "subtitle": "Весенний номер",
        "description": "Тестовый выпуск для проверки работы админки",
        "is_special": "false",
        "file_url": "documents/newspaper/test.pdf",
        "file_size": "1.5 МБ"
    },
    headers=headers
)
assert create_np.status_code == 201, f"Create newspaper failed: {create_np.text}"
np_id = create_np.json()["id"]
print(f"Created test newspaper #{np_id}")

# Delete test newspaper
del_np = client.delete(f"/api/life/newspapers/{np_id}", headers=headers)
assert del_np.status_code == 200, f"Delete newspaper failed: {del_np.text}"
print("Deleted test newspaper successfully")

# Create a test theatre play
create_tp = client.post(
    "/api/life/theatre-plays",
    data={
        "title": "«Тестовая сказка»",
        "author_or_director": "Андреева М. В.",
        "year": "2026",
        "awards": "Диплом победителя",
        "description": "Тестовая постановка",
        "video_url": "https://vk.com/video123"
    },
    headers=headers
)
assert create_tp.status_code == 201, f"Create theatre play failed: {create_tp.text}"
tp_id = create_tp.json()["id"]
print(f"Created test theatre play #{tp_id}")

# Delete test play
del_tp = client.delete(f"/api/life/theatre-plays/{tp_id}", headers=headers)
assert del_tp.status_code == 200
print("Deleted test theatre play successfully")

# Create a test camp shift
create_cs = client.post(
    "/api/life/camp-shifts",
    data={
        "year": 2027,
        "title": "Летняя смена 2027",
        "dates": "1-20 июня 2027",
        "vk_album_url": "https://vk.com/album_test",
        "description": "Тестовая смена",
        "status": "upcoming"
    },
    headers=headers
)
assert create_cs.status_code == 201, f"Create camp shift failed: {create_cs.text}"
cs_id = create_cs.json()["id"]
print(f"Created test camp shift #{cs_id}")

# Delete test shift
del_cs = client.delete(f"/api/life/camp-shifts/{cs_id}", headers=headers)
assert del_cs.status_code == 200
print("Deleted test camp shift successfully")

# Clean up test admin
db.delete(admin)
db.commit()
db.close()
print("\nALL ADMIN AND API INTEGRATION TESTS PASSED PERFECTLY!")
