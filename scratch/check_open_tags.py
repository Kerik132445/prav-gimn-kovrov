with open('life.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
m = re.search(r'(<main[^>]*>.*?<section class="newspaper-section")', text, re.DOTALL)
if m:
    # find all opening and closing tags between main and newspaper-section
    content = m.group(1)
    tags = re.findall(r'<(/?[a-zA-Z0-9_-]+)[^>]*>', content)
    stack = []
    for t in tags:
        if t.startswith('/'):
            tag = t[1:]
            if stack and stack[-1] == tag:
                stack.pop()
        else:
            if not t in ['img', 'br', 'hr', 'input', 'meta', 'link']:
                stack.append(t)
    print("Open tags before newspaper-section:", stack)
