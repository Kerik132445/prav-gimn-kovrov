with open('life.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Theater photo to actual stage photo
old_theater_img = '<img src="assets/images/news/award-festival.webp" alt="Выступление театральной студии «Встреча» на фестивале" width="450" height="300" loading="lazy">'
new_theater_img = '<img src="assets/images/clubs/theater-stage-1.webp" alt="Постановка театральной студии «Встреча» на сцене гимназии" width="450" height="300" loading="lazy">'

if old_theater_img in text:
    text = text.replace(old_theater_img, new_theater_img, 1)
    print("Theater image updated")
else:
    print("Old theater image not found")

# 2. Update Camp photo to actual camp kids photo
old_camp_img = '<img src="assets/images/news/troickoe-camp.webp" alt="Летний лагерь гимназистов" width="450" height="300" loading="lazy">'
new_camp_img = '<img src="assets/images/clubs/camp-kids.webp" alt="Воспитанники пришкольного лагеря гимназии" width="450" height="300" loading="lazy">'

if old_camp_img in text:
    text = text.replace(old_camp_img, new_camp_img, 1)
    print("Camp image updated")
else:
    print("Old camp image not found")

# 3. Add VPK emblem and VK link to VPK card
old_vpk = """					<div class="club-mentor">
						<img src="assets/images/teachers/mashtakov-dmitri.webp" alt="Маштаков Дмитрий Владимирович" class="club-mentor__avatar" width="48" height="48" loading="lazy">
						<div class="club-mentor__info">
							<span class="club-mentor__name">Маштаков Д. В.</span>
							<span class="club-mentor__role">Руководитель военно-патриотического клуба</span>
						</div>
					</div>
				</div>"""

new_vpk = """					<div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-top: 14px;">
						<div class="club-mentor">
							<img src="assets/images/teachers/mashtakov-dmitri.webp" alt="Маштаков Дмитрий Владимирович" class="club-mentor__avatar" width="48" height="48" loading="lazy">
							<div class="club-mentor__info">
								<span class="club-mentor__name">Маштаков Дмитрий Владимирович</span>
								<span class="club-mentor__role">Руководитель военно-патриотического клуба, учитель ОБЖ</span>
							</div>
						</div>

						<a href="https://vk.ru/svgeorgi" target="_blank" rel="noopener noreferrer" class="newspaper-archive-link" style="padding: 8px 14px; font-size: 12.5px; border-radius: 8px;">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
								<polyline points="15 3 21 3 21 9"></polyline>
								<line x1="10" y1="14" x2="21" y2="3"></line>
							</svg>
							Группа клуба во «ВКонтакте»
						</a>
					</div>
				</div>"""

if old_vpk in text:
    text = text.replace(old_vpk, new_vpk, 1)
    print("VPK mentor and link updated")
else:
    print("Old VPK block not found")

with open('life.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("Updated life.html")
