with open('life.html', 'r', encoding='utf-8') as f:
    text = f.read()

choir_old = """				<div class="choir-instruments">
					<div class="choir-instrument">
						<span class="choir-instrument__icon" aria-hidden="true">🪕</span>
						<span class="choir-instrument__name">Балалайка</span>
						<span class="choir-instrument__desc">Традиции русской инструментальной музыки</span>
					</div>

					<div class="choir-instrument">
						<span class="choir-instrument__icon" aria-hidden="true">🪗</span>
						<span class="choir-instrument__name">Баян</span>
						<span class="choir-instrument__desc">Освоение гармонии, ритма и ансамблевой игры</span>
					</div>

					<div class="choir-instrument">
						<span class="choir-instrument__icon" aria-hidden="true">🎸</span>
						<span class="choir-instrument__name">Гитара</span>
						<span class="choir-instrument__desc">Классический репертуар и аккомпанемент</span>
					</div>

					<div class="choir-instrument">
						<span class="choir-instrument__icon" aria-hidden="true">🎻</span>
						<span class="choir-instrument__name">Скрипка</span>
						<span class="choir-instrument__desc">Академическая школа и струнное мастерство</span>
					</div>

					<div class="choir-instrument">
						<span class="choir-instrument__icon" aria-hidden="true">🎶</span>
						<span class="choir-instrument__name">Хоровое пение</span>
						<span class="choir-instrument__desc">Духовные песнопения и русская классика</span>
					</div>
				</div>"""

choir_new = """				<!-- Хоровые коллективы по ступеням -->
				<div class="theatre-plays" style="margin-bottom: 16px;">
					<span class="theatre-plays__label">Хоровые коллективы гимназии:</span>
					<div class="choir-levels">
						<span class="choir-level-pill">🌟 Младший хор «Светлячки» (1–4 кл.)</span>
						<span class="choir-level-pill">🎵 Средний хор (5–7 кл.)</span>
						<span class="choir-level-pill">✨ Старший хор «Сретение» (8–11 кл. • участие в архиерейских службах)</span>
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
						<span class="choir-instrument__desc">Академическая школа, чистота строя и звукоизвлечение</span>
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
    with open('life.html', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Choir updated successfully!")
else:
    print("Choir target still not found")
