with open('css/style.css', encoding='utf-8') as f:
    lines = f.readlines()

def show_range(start, end):
    print(f'=== Lines {start} to {end} ===')
    for i in range(start-1, min(end, len(lines))):
        print(f'{i+1}: {lines[i]}', end='')

show_range(655, 737)
show_range(4460, 4505)
show_range(9248, 9265)
show_range(11495, 11525)
show_range(11615, 11630)
