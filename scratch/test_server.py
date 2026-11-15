import http.server
import socketserver
import threading
import urllib.request
import time

PORT = 8085
Handler = http.server.SimpleHTTPRequestHandler

class QuietServer(socketserver.TCPServer):
    allow_reuse_address = True

httpd = QuietServer(("", PORT), Handler)
t = threading.Thread(target=httpd.serve_forever, daemon=True)
t.start()
time.sleep(0.5)

pages = [
    "index.html", "apply.html", "class_schedule.html", "contact.html",
    "diary.html", "documents.html", "food.html", "life.html",
    "news.html", "story_school.html", "teachers.html", "sveden/index.html",
    "assets/icons/logo_star.png", "assets/icons/max_white.svg",
    "assets/icons/benefit-support.svg", "assets/icons/benefit-social.svg",
    "assets/icons/cutlery.svg", "assets/icons/search-input.svg",
    "assets/icons/quick-schedule.svg", "assets/icons/quick-diary.svg",
    "assets/icons/quick-food.svg", "assets/icons/quick-docs.svg",
    "assets/icons/schedule-breakfast.svg", "assets/icons/schedule-lunch.svg",
    "assets/icons/schedule-pause.svg", "assets/icons/location-blue.svg",
    "assets/icons/bus-blue.svg", "assets/icons/phone-blue.svg",
    "assets/icons/check.svg", "assets/images/teachers/teacher-placeholder.svg",
    "assets/images/students-about.webp", "assets/images/hero-bg.webp",
    "assets/images/news1.webp"
]

all_ok = True
for p in pages:
    url = f"http://localhost:{PORT}/{p}"
    try:
        req = urllib.request.urlopen(url)
        print(f"OK [200]: {p}")
    except Exception as e:
        print(f"FAIL: {p} -> {e}")
        all_ok = False

httpd.shutdown()
if all_ok:
    print("\nALL PAGES AND CRITICAL ASSETS SERVED SUCCESSFULLY (200 OK)!")
else:
    print("\nSOME ASSETS FAILED!")
