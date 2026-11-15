import os
import re

root_dir = os.path.abspath(".")

html_files = []
for dirpath, _, filenames in os.walk(root_dir):
    if "node_modules" in dirpath or ".git" in dirpath or "scratch" in dirpath:
        continue
    for f in filenames:
        if f.endswith(".html"):
            html_files.append(os.path.join(dirpath, f))

css_files = []
for dirpath, _, filenames in os.walk(root_dir):
    if "node_modules" in dirpath or ".git" in dirpath or "scratch" in dirpath:
        continue
    for f in filenames:
        if f.endswith(".css"):
            css_files.append(os.path.join(dirpath, f))

missing = []
checked = 0

# Check HTML files
for hf in html_files:
    hf_rel = os.path.relpath(hf, root_dir)
    hf_dir = os.path.dirname(hf)
    with open(hf, "r", encoding="utf-8") as f:
        content = f.read()

    # Find src in img
    srcs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', content, re.IGNORECASE)
    # Find srcset in source
    srcsets = re.findall(r'<source[^>]+srcset=["\']([^"\']+)["\']', content, re.IGNORECASE)
    # Inline style background-image: url(...)
    inline_urls = re.findall(r'url\([\'"]?([^"\'\)]+)[\'"]?\)', content)

    all_links = srcs + srcsets + inline_urls
    for link in all_links:
        if link.startswith("http") or link.startswith("data:") or link.startswith("#") or "${" in link:
            continue
        # strip query parameters
        clean_link = link.split("?")[0].split("#")[0]
        # Resolve target
        target = os.path.normpath(os.path.join(hf_dir, clean_link))
        checked += 1
        if not os.path.exists(target):
            missing.append((hf_rel, link, target))

# Check CSS files
for cf in css_files:
    cf_rel = os.path.relpath(cf, root_dir)
    cf_dir = os.path.dirname(cf)
    with open(cf, "r", encoding="utf-8") as f:
        content = f.read()

    urls = re.findall(r'url\([\'"]?([^"\'\)]+)[\'"]?\)', content)
    for link in urls:
        if link.startswith("http") or link.startswith("data:") or link.startswith("#"):
            continue
        clean_link = link.split("?")[0].split("#")[0]
        target = os.path.normpath(os.path.join(cf_dir, clean_link))
        checked += 1
        if not os.path.exists(target):
            missing.append((cf_rel, link, target))

print(f"Total media/resource references checked: {checked}")
print(f"Total missing: {len(missing)}")
for hf_rel, link, target in missing:
    print(f"  FAILED in {hf_rel}: '{link}' -> {target}")
