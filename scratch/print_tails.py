import re

def print_tail(filename):
    with open(filename, encoding='utf-8') as f:
        c = f.read()
    m = re.search(r'(<div class="footer-bottom"[\s\S]*?</footer>)', c)
    if not m:
        m = re.search(r'(<div class="footer-copyright"[\s\S]*?</footer>)', c)
    print(f'=== {filename} ===')
    if m:
        print(m.group(1))

print_tail('index.html')
print_tail('sveden/index.html')
print_tail('contact.html')
print_tail('policy.html')
