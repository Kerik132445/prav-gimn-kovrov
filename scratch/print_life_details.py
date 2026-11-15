with open('life.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re

# Check theater
theater = re.search(r'(<!-- 1\.1\. Театральная студия.*?)(?=<!-- 1\.2|$)', text, re.DOTALL)
if theater:
    print("=== THEATER ===")
    print(theater.group(1))

# Check choir
choir = re.search(r'(<!-- 1\.3\. Хор.*?)(?=<!-- 1\.4|$)', text, re.DOTALL)
if choir:
    print("=== CHOIR ===")
    print(choir.group(1))

# Check newspaper
newspaper = re.search(r'(<section class="newspaper-section".*?</section>)', text, re.DOTALL)
if newspaper:
    print("=== NEWSPAPER ===")
    print(newspaper.group(1))

# Check camp
camp = re.search(r'(<section class="camp-section".*?</section>)', text, re.DOTALL)
if camp:
    print("=== CAMP ===")
    print(camp.group(1))
