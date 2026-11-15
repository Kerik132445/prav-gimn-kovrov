with open('css/style.css', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's check if the media query at line 16732 is properly closed!
idx = text.find('@media (max-width: 600px) {\n\t.newspaper-section {')
if idx != -1:
    snippet = text[idx:idx+500]
    print("Found @media (max-width: 600px):")
    print(snippet)
else:
    print("Not found exact string, searching substring:")
    idx = text.find('@media (max-width: 600px)')
    print(text[idx:idx+500])
