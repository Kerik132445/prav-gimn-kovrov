import re

def get_footer_tail(filename):
    with open(filename, encoding='utf-8') as f:
        c = f.read()
    m = re.search(r'(<div class="footer-bottom"[\s\S]*?</footer>)', c)
    if m:
        return m.group(1)
    m2 = re.search(r'(<div class="footer-copyright"[\s\S]*?</footer>)', c)
    if m2:
        return m2.group(1)
    return None

print('index.html tail length:', len(get_footer_tail('index.html')))
print('sveden/index.html tail length:', len(get_footer_tail('sveden/index.html')))
print('contact.html tail length:', len(get_footer_tail('contact.html')))
print('policy.html tail length:', len(get_footer_tail('policy.html')))
