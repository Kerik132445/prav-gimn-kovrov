with open('css/style.css', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.splitlines()
depth = 0
unmatched = []

for line_num, line in enumerate(lines, start=1):
    # remove strings and comments roughly
    clean_line = line.split('/*')[0]
    for ch in clean_line:
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth < 0:
                print(f"Negative depth at line {line_num}!")
                depth = 0

print(f"Final brace depth at end of css/style.css: {depth}")
