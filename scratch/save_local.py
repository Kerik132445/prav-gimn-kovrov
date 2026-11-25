# -*- coding: utf-8 -*-
with open('scratch/create_presentation_doc.py', 'r', encoding='utf-8') as src:
    text = src.read()
start = text.find('content = """') + len('content = """')
end = text.rfind('"""')
with open('PRESENTATION_GUIDE.md', 'w', encoding='utf-8') as dst:
    dst.write(text[start:end])
print("Done local copy")
