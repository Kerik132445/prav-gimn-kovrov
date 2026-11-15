import os
import re

root_dir = os.path.abspath(".")

root_html_files = [
    "apply.html", "class_schedule.html", "contact.html", "diary.html",
    "documents.html", "food.html", "index.html", "life.html",
    "news.html", "policy.html", "rostochek.html", "search.html",
    "story_school.html", "teachers.html"
]

sveden_dir = os.path.join(root_dir, "sveden")
sveden_files = [os.path.join("sveden", f) for f in os.listdir(sveden_dir) if f.endswith(".html")]

all_files = root_html_files + sveden_files

stats = {"logo": 0, "telegram": 0}

for rel_path in all_files:
    file_path = os.path.join(root_dir, rel_path)
    if not os.path.exists(file_path):
        continue
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    orig_content = content

    # Replace logo_star.png with logo-gymnasium.svg
    if "logo_star.png" in content:
        content = content.replace("logo_star.png", "logo-gymnasium.svg")
        stats["logo"] += 1

    # Replace images-Photoroom.png with telegram.svg
    if "images-Photoroom.png" in content:
        # Also improve alt and aria-label if present
        content = content.replace("images-Photoroom.png", "telegram.svg")
        stats["telegram"] += 1

    if content != orig_content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {rel_path}")

print(f"Done. Replaced logo in {stats['logo']} files, telegram in {stats['telegram']} files.")
