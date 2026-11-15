import os

root_dir = os.path.abspath(".")

for dirpath, _, filenames in os.walk(root_dir):
    if "node_modules" in dirpath or ".git" in dirpath or "scratch" in dirpath:
        continue
    for f in filenames:
        if f.endswith(".html"):
            path = os.path.join(dirpath, f)
            with open(path, "r", encoding="utf-8") as file:
                content = file.read()
            
            orig = content
            content = content.replace('alt="Мессенджер"', 'alt="Telegram"')
            content = content.replace('aria-label="Мессенджер"', 'aria-label="Telegram"')
            content = content.replace('whatsap_icon.svg', 'whatsapp.svg')
            
            if content != orig:
                with open(path, "w", encoding="utf-8") as file:
                    file.write(content)
                print(f"Refined socials in {os.path.relpath(path, root_dir)}")

print("Social refinement complete.")
