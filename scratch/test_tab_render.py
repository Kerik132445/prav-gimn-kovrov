from PIL import Image, ImageDraw

def render_tabs():
    im = Image.new('RGB', (600, 120), '#F8FAFC')
    draw = ImageDraw.Draw(im)

    # We draw 3 tab cards:
    # Tab 1: Spassky
    # Tab 2: Pokrovsky
    # Tab 3: Sports

    tabs = [
        ('Спасский корпус', '1–4 классы • Приёмная', True, 20),
        ('Покровский корпус', '5–11 классы • Учительская', False, 215),
        ('Спортзал', 'Спорткомплекс', False, 410)
    ]

    for title, badge, active, x in tabs:
        bg = '#FFFFFF' if active else '#F8FAFC'
        color = '#2563EB' if active else '#334155'
        draw.rounded_rectangle([x, 15, x + 175, 105], radius=12, fill=bg, outline='#E2E8F0' if not active else '#BFDBFE', width=1)
        draw.text((x + 36, 32), title, fill=color)
        draw.text((x + 14, 60), badge, fill='#64748B')

    im.save('scratch/tabs_render.png')
    print('Tabs preview image saved.')

render_tabs()
