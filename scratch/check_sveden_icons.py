import bs4

with open('sveden/index.html', 'r', encoding='utf-8') as f:
    soup = bs4.BeautifulSoup(f.read(), 'html.parser')

cards = soup.find_all(class_='sveden-card')
print(f'Total cards: {len(cards)}')
for idx, card in enumerate(cards):
    title_el = card.find(class_='sveden-card__title')
    title = title_el.get_text(strip=True) if title_el else 'No title'
    # look for icon container or image/svg
    icon_div = card.find(class_='sveden-card__icon') or card.find(class_='sveden-card__badge-wrap')
    print(f'Card {idx+1}: {title}')
    if icon_div:
        print('  Icon snippet:', str(icon_div).replace('\n', ' ')[:250])
    else:
        # print first img or svg
        media = card.find(['img', 'svg'])
        print('  Media:', str(media)[:200] if media else 'None')
