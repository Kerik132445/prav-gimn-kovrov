with open('life.html', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update Theater Studio
theater_old = """					<p class="club-card-major__desc">
						Одно из главных и любимых творческих объединений гимназии. Занятия в студии помогают ребятам раскрыть артистический потенциал, освоить сценическую речь, основы пластики и актерского мастерства. Спектакли студии традиционно становятся яркими событиями школьной и городской культурной жизни.
					</p>

					<div class="theatre-plays">
						<span class="theatre-plays__label">Известные постановки студии:</span>
						<div class="theatre-plays__list">
							<span class="theatre-play-pill">🎭 «Принцесса Кру»</span>
							<span class="theatre-play-pill">🕊️ «Белый Ангел Москвы»</span>
							<span class="theatre-play-pill">📜 «Можно спросить Нину?»</span>
						</div>
					</div>"""

theater_new = """					<blockquote class="theatre-quote">
						«Театр – это такая кафедра, с которой можно много сказать миру добра. Нет такого орудия в мире, которое не было бы предназначено на службу Богу».
						<cite>— Н. В. Гоголь</cite>
					</blockquote>

					<p class="club-card-major__desc">
						Одно из главных и любимых творческих объединений гимназии. Занятия в студии помогают ребятам раскрыть артистический потенциал, освоить сценическую речь, основы пластики и актерского мастерства. Спектакли студии приурочены к праздникам православного круга и традиционно становятся яркими событиями школьной и городской культурной жизни.
					</p>

					<div class="theatre-plays">
						<span class="theatre-plays__label">Репертуар и известные постановки студии:</span>
						<div class="theatre-plays__list">
							<span class="theatre-play-pill">🎭 «Принцесса Кру»</span>
							<span class="theatre-play-pill">🕊️ «Белый Ангел Москвы»</span>
							<span class="theatre-play-pill">📜 «Можно спросить Нину?»</span>
							<span class="theatre-play-pill">🎖️ «Апрель 45-го»</span>
							<span class="theatre-play-pill">❄️ «Снегурочка»</span>
						</div>
					</div>"""

if theater_old in text:
    text = text.replace(theater_old, theater_new, 1)
    print("Theater updated successfully")
else:
    print("Theater target not found")

# 2. Update Choir
choir_old = """				<div class="choir-instruments">
					<div class="choir-instrument">
						<span class="choir-instrument__icon" aria-hidden="true">🪕</span>
						<span class="choir-instrument__name">Балалайка</span>
						<span class="choir-instrument__desc">Традиции русской инструментальной музыки</span>
					</div>

					<div class="choir-instrument">
						<span class="choir-instrument__icon" aria-hidden="true">🪗</span>
						<span class="choir-instrument__name">Баян</span>
						<span class="choir-instrument__desc">Освоение гармонии и аккомпанемента</span>
					</div>

					<div class="choir-instrument">
						<span class="choir-instrument__icon" aria-hidden="true">🎸</span>
						<span class="choir-instrument__name">Гитара</span>
						<span class="choir-instrument__desc">Классическая и авторская песня</span>
					</div>

					<div class="choir-instrument">
						<span class="choir-instrument__icon" aria-hidden="true">🎻</span>
						<span class="choir-instrument__name">Скрипка</span>
						<span class="choir-instrument__desc">Академическая техника и чистота звука</span>
					</div>

					<div class="choir-instrument">
						<span class="choir-instrument__icon" aria-hidden="true">🎶</span>
						<span class="choir-instrument__name">Хоровое пение</span>
						<span class="choir-instrument__desc">Гармоничное многоголосие и духовные песнопения</span>
					</div>
				</div>"""

choir_new = """				<!-- Хоровые коллективы по ступеням -->
				<div class="theatre-plays" style="margin-bottom: 16px;">
					<span class="theatre-plays__label">Хоровые коллективы гимназии:</span>
					<div class="choir-levels">
						<span class="choir-level-pill">🌟 Хор младших классов «Светлячки» (1–4 кл.)</span>
						<span class="choir-level-pill">🎵 Хор средних классов (5–7 кл.)</span>
						<span class="choir-level-pill">✨ Старший хор «Сретение» (8–11 кл. • участие в архиерейских богослужениях)</span>
					</div>
				</div>

				<div class="choir-instruments">
					<div class="choir-instrument">
						<span class="choir-instrument__icon" aria-hidden="true">🪕</span>
						<span class="choir-instrument__name">Балалайка и домра</span>
						<span class="choir-instrument__desc">Традиции русского народного инструментального исполнительства</span>
					</div>

					<div class="choir-instrument">
						<span class="choir-instrument__icon" aria-hidden="true">🪗</span>
						<span class="choir-instrument__name">Баян</span>
						<span class="choir-instrument__desc">Освоение полифонии, гармонии и аккомпанемента</span>
					</div>

					<div class="choir-instrument">
						<span class="choir-instrument__icon" aria-hidden="true">🎸</span>
						<span class="choir-instrument__name">Гитара</span>
						<span class="choir-instrument__desc">Классический репертуар и песенная традиция</span>
					</div>

					<div class="choir-instrument">
						<span class="choir-instrument__icon" aria-hidden="true">🎻</span>
						<span class="choir-instrument__name">Скрипка</span>
						<span class="choir-instrument__desc">Академическая техника, чистота строя и звукоизвлечение</span>
					</div>

					<div class="choir-instrument">
						<span class="choir-instrument__icon" aria-hidden="true">🎶</span>
						<span class="choir-instrument__name">Хоровое пение</span>
						<span class="choir-instrument__desc">Многоголосие, духовные песнопения и фестивальный репертуар</span>
					</div>
				</div>

				<div class="choir-schools-note">
					<strong>Музыкальные школы на базе гимназии:</strong> в здании школы регулярно ведут занятия педагоги <strong>ДМШ № 1</strong> (класс архаического фольклора) и <strong>ДМШ № 2</strong> (инструментальные классы балалайки, баяна, гитары, домры и скрипки).
				</div>"""

if choir_old in text:
    text = text.replace(choir_old, choir_new, 1)
    print("Choir updated successfully")
else:
    print("Choir target not found")

# 3. Update Newspaper Archive
news_old = """		<!-- Архив выпусков (аккуратная заглушка) -->
		<div class="newspaper-archive-card">
			<div class="newspaper-archive-card__icon" aria-hidden="true">
				<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
					<polyline points="7 10 12 15 17 10"></polyline>
					<line x1="12" y1="15" x2="12" y2="3"></line>
				</svg>
			</div>
			<h3 class="newspaper-archive-card__title">Архив выпусков газеты</h3>
			<p class="newspaper-archive-card__desc">
				Электронный архив номеров находится в процессе оцифровки и в скором времени будет доступен для чтения в формате PDF.
			</p>
			<span class="newspaper-archive-card__badge">
				📖 Печатные выпуски доступны в школьной библиотеке
			</span>
		</div>"""

news_new = """		<!-- Архив выпусков -->
		<div class="newspaper-archive-card">
			<div class="newspaper-archive-card__icon" aria-hidden="true">
				<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
					<polyline points="7 10 12 15 17 10"></polyline>
					<line x1="12" y1="15" x2="12" y2="3"></line>
				</svg>
			</div>
			<h3 class="newspaper-archive-card__title">Архив номеров газеты</h3>
			<p class="newspaper-archive-card__desc">
				«Доброе слово» издаётся с 2011 года. В архиве школы бережно собрано более 30 номеров, а также историко-литературный спецвыпуск <em>«Сретенские витражи»</em>.
			</p>
			<div class="newspaper-archive-links">
				<a href="https://pravgimn-kovrov.ru/vospitanie/gimnazicheskaya-gazeta-dobroe-slovo.html" target="_blank" rel="noopener noreferrer" class="newspaper-archive-link">
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
						<polyline points="15 3 21 3 21 9"></polyline>
						<line x1="10" y1="14" x2="21" y2="3"></line>
					</svg>
					Открыть архив выпусков (PDF)
				</a>
			</div>
			<span class="newspaper-archive-card__badge" style="margin-top: 10px;">
				📖 Печатные подшивки номеров доступны в школьной библиотеке
			</span>
		</div>"""

if news_old in text:
    text = text.replace(news_old, news_new, 1)
    print("Newspaper updated successfully")
else:
    print("Newspaper target not found")

# 4. Update Summer Camp
camp_old = """				<div class="camp-feature">
					<span class="camp-feature__icon" aria-hidden="true">🎯</span>
					<div class="camp-feature__content">
						<span class="camp-feature__name">Совместный досуг</span>
						<span class="camp-feature__sub">Мастер-классы, викторины, праздники и командные игры</span>
					</div>
				</div>
			</div>
		</div>"""

camp_new = """				<div class="camp-feature">
					<span class="camp-feature__icon" aria-hidden="true">🎯</span>
					<div class="camp-feature__content">
						<span class="camp-feature__name">Совместный досуг</span>
						<span class="camp-feature__sub">Мастер-классы, викторины, праздники и командные игры</span>
					</div>
				</div>
			</div>

			<a href="https://vk.com/album-178231686_295083175" target="_blank" rel="noopener noreferrer" class="camp-album-btn">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
					<circle cx="12" cy="13" r="4"></circle>
				</svg>
				Фотоальбом лагерной смены в VK
			</a>
		</div>"""

if camp_old in text:
    text = text.replace(camp_old, camp_new, 1)
    print("Camp updated successfully")
else:
    print("Camp target not found")

with open('life.html', 'w', encoding='utf-8') as f:
    f.write(text)
print("Saved life.html")
