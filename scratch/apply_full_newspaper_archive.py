import os

# Load catalog
pdf_dir = 'documents/newspaper'
files = [f for f in os.listdir(pdf_dir) if f.endswith('.pdf')]

special_names = {
    ('2011', 1): ("Исторический первый выпуск", "Первый номер школьной газеты гимназии, положивший начало доброй 15-летней традиции."),
    ('2011', 2): ("Пасхальный выпуск", "Светлое Христово Воскресение, весенние праздники, дела милосердия и поздравления."),
    ('2011', 3): ("Окончание учебного года", "Итоги первого учебного года издания, молебен, первые выпускники гимназии."),
    ('2011', 4): ("День знаний • 1 сентября", "Торжественная линейка, новые первоклассники и начало нового учебного года."),
    ('2011', 5): ("Престольные праздники", "Покров Пресвятой Богородицы, паломнические поездки и духовная жизнь гимназии."),
    ('2011', 6): ("Школьная осень", "Творческие конкурсы, очерки о педагогах и стихи юных воспитанников."),
    ('2011', 7): ("Ко дню матери", "Теплые слова наставникам и мамам, рассказы о семейных ценностях и духовных корнях."),
    ('2011', 8): ("Зимние ожидания", "Подготовка к Рождеству Христову, добрые дела и зимние благотворительные ярмарки."),
    ('2011', 10): ("Итоги 2011 года", "Большой праздничный обзор событий первого года гимназической газеты."),
    
    ('2012', 1): ("Рождественский выпуск", "Рождество Христово, святочные дни, Рождественский вертеп и театральные постановки."),
    ('2012', 2): ("Сретение Господне", "День православной молодежи, встречи с духовенством и беседы о вере."),
    ('2012', 3): ("Весенний номер", "Великий пост, время духовного сосредоточения и помощи ближним."),
    ('2012', 4): ("Пасхальный выпуск", "Светлая седмица, пасхальные куличи, праздничный хоровой концерт гимназии."),
    ('2012', 5): ("Ко Дню Победы", "Память о подвиге предков, встречи с ветеранами и ратная слава Отечества."),
    ('2012', 6): ("Окончание учебного года", "Последний звонок, напутствие выпускникам и планы летнего пришкольного лагеря."),
    ('2012', 7): ("Летняя смена", "Летний отдых гимназистов, походы, экскурсии по святым местам и краеведение."),
    ('2012', 8): ("Здравствуй, школа!", "Начало 2012/2013 учебного года, новые кружки и творческие планы гимназии."),
    ('2012', 9): ("Осенний вестник", "День гимназии, престольный праздник и успехи учеников в олимпиадах."),
    
    ('2013', 1): ("Рождественский выпуск", "Праздник Рождества Христова, колядки, архиерейская служба и поздравления."),
    ('2013', 2): ("Февральский номер", "День защитника Отечества, клуб святого Георгия Победоносца и патриотическое воспитание."),
    ('2013', 3): ("Весенние тропы", "Дни православной книги, выставка редких изданий и духовные чтения."),
    ('2013', 4): ("Пасха Красная", "Пасхальный хоровой фестиваль, поздравления от духовника гимназии."),
    ('2013', 5): ("Праздник славянской письменности", "Святые Кирилл и Мефодий, традиции церковнославянского языка и русской грамоты."),
    ('2013', 6): ("Итоги года и выпуск", "Выпускной акт, напутственные слова учителей и благодарность родителям."),
    
    ('2014', 1): ("Рождественский номер", "Рождественские праздники, школьные святочные спектакли студии «Встреча»."),
    ('2014', 2): ("Пасхальный выпуск", "Христос Воскресе! Пасхальный фестиваль «Глас веры» и благотворительные дела."),
    ('2014', 3): ("Окончание учебного года", "Праздник последнего звонка, духовные размышления и летопись учебного года."),
    
    ('2015', 1): ("Рождественский выпуск", "Рождество Христово, благотворительная ярмарка и зимние каникулы."),
    ('2015', 2): ("Пасхальный выпуск", "Пасхальный звон, выставка детского прикладного творчества и праздничные службы."),
    ('2015', 3): ("Итоги учебного года", "Благодарственный молебен, чествование лауреатов олимпиад и конкурсов, выпускной.")
}

items = []
for f in files:
    sz = os.path.getsize(os.path.join(pdf_dir, f)) / (1024 * 1024)
    if 'витражи' in f.lower():
        items.append({
            'file': f,
            'year': '2023',
            'num_int': 999,
            'num_label': 'Спецвыпуск',
            'title': '«Сретенские витражи»',
            'season': 'Литературно-исторический альманах',
            'desc': 'Специальный выпуск: летопись гимназии, воспоминания наставников, стихи и эссе воспитанников.',
            'size': f"{sz:.1f} МБ",
            'is_special': True
        })
    elif f.startswith('Dobroe_slovo_'):
        parts = f.replace('Dobroe_slovo_', '').replace('.pdf', '').split('_')
        yr = parts[0]
        num = int(parts[1])
        theme, desc = special_names.get((yr, num), (f"Выпуск № {num}", "События школьной жизни, паломнические поездки и творчество."))
        items.append({
            'file': f,
            'year': yr,
            'num_int': num,
            'num_label': f"№ {num}",
            'title': f"«Доброе слово» № {num} ({yr})",
            'season': theme,
            'desc': desc,
            'size': f"{sz:.1f} МБ",
            'is_special': False
        })

items.sort(key=lambda x: (int(x['year']), x['num_int']), reverse=True)

# Generate cards HTML
cards_html = []
for it in items:
    pdf_rel = f"documents/newspaper/{it['file']}"
    special_class = "newspaper-card--special" if it['is_special'] else ""
    year_badge = "Спецвыпуск" if it['is_special'] else f"{it['year']} год"
    card = f"""\t\t\t<article class="newspaper-card {special_class}" data-year="{it['year']}">
\t\t\t\t<div class="newspaper-card__cover">
\t\t\t\t\t<div class="cover-masthead">
\t\t\t\t\t\t<span class="cover-school">Православная гимназия</span>
\t\t\t\t\t\t<span class="cover-name">ДОБРОЕ СЛОВО</span>
\t\t\t\t\t\t<div class="cover-rule"></div>
\t\t\t\t\t</div>
\t\t\t\t\t<div class="cover-meta">
\t\t\t\t\t\t<span class="cover-num">{it['num_label']} ({it['year']})</span>
\t\t\t\t\t\t<span class="cover-badge-tag">{it['season'][:26]}</span>
\t\t\t\t\t</div>
\t\t\t\t\t<div class="cover-preview-lines">
\t\t\t\t\t\t<div class="cover-line"></div>
\t\t\t\t\t\t<div class="cover-line short"></div>
\t\t\t\t\t\t<div class="cover-line"></div>
\t\t\t\t\t</div>
\t\t\t\t</div>

\t\t\t\t<div class="newspaper-card__body">
\t\t\t\t\t<div class="newspaper-card__header">
\t\t\t\t\t\t<span class="newspaper-card__year-badge">{year_badge}</span>
\t\t\t\t\t\t<span class="newspaper-card__filesize">{it['size']} • PDF</span>
\t\t\t\t\t</div>
\t\t\t\t\t<h4 class="newspaper-card__title">{it['title']}</h4>
\t\t\t\t\t<p class="newspaper-card__desc">{it['desc']}</p>
\t\t\t\t\t<div class="newspaper-card__actions">
\t\t\t\t\t\t<button type="button" class="btn-read-issue" 
\t\t\t\t\t\t\t\tdata-pdf="{pdf_rel}" 
\t\t\t\t\t\t\t\tdata-title="Газета «Доброе слово» — {it['title']}">
\t\t\t\t\t\t\t<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
\t\t\t\t\t\t\t\t<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
\t\t\t\t\t\t\t\t<circle cx="12" cy="12" r="3"></circle>
\t\t\t\t\t\t\t</svg>
\t\t\t\t\t\t\tЧитать онлайн
\t\t\t\t\t\t</button>
\t\t\t\t\t\t<a href="{pdf_rel}" download="{it['file']}" class="btn-download-icon" title="Скачать PDF ({it['size']})" aria-label="Скачать PDF">
\t\t\t\t\t\t\t<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
\t\t\t\t\t\t\t\t<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
\t\t\t\t\t\t\t\t<polyline points="7 10 12 15 17 10"></polyline>
\t\t\t\t\t\t\t\t<line x1="12" y1="15" x2="12" y2="3"></line>
\t\t\t\t\t\t\t</svg>
\t\t\t\t\t\t</a>
\t\t\t\t\t</div>
\t\t\t\t</div>
\t\t\t</article>"""
    cards_html.append(card)

grid_content = "\n\n".join(cards_html)

new_newspaper_section = f"""	<!-- 2. РАЗДЕЛ: ШКОЛЬНАЯ ГАЗЕТА «ДОБРОЕ СЛОВО» (ПОЛНЫЙ МЕДИА-АРХИВ) -->
	<section class="newspaper-section" id="newspaper">

		<!-- Верхний блок: Редколлегия и флагманский номер -->
		<div class="newspaper-header-block">
			<div class="newspaper-info">
				<span class="newspaper-info__tag">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
						<path d="M18 14h-8"></path>
						<path d="M15 18h-5"></path>
						<path d="M10 6h8v4h-8V6Z"></path>
					</svg>
					Школьная печать • Летопись гимназии с 2011 года
				</span>

				<h2 class="newspaper-info__title">Школьная газета «Доброе слово»</h2>

				<p class="newspaper-info__desc">
					Печатное издание Православной гимназии г. Коврова, освещающее ключевые события духовной, учебной и творческой жизни школы. На страницах номеров — духовные беседы, репортажи о паломнических поездках, интервью с наставниками, очерки к праздникам Рождества и Пасхи, а также авторские стихи и эссе воспитанников.
				</p>

				<div class="newspaper-editorial">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="newspaper-editorial__icon" aria-hidden="true">
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
						<circle cx="9" cy="7" r="4"></circle>
						<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
						<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
					</svg>
					<div class="newspaper-editorial__text">
						<strong>Ученическая редколлегия:</strong> в подготовке выпусков участвуют гимназисты средних и старших классов под наставничеством педагогов словесности. Ребята пробуют себя в роли корреспондентов, фотографов, интервьюеров и верстальщиков.
					</div>
				</div>

				<div class="newspaper-badges">
					<span class="newspaper-stat-badge">📑 31 оцифрованный выпуск</span>
					<span class="newspaper-stat-badge">🕊️ Полный архив с 2011 года</span>
					<span class="newspaper-stat-badge">📖 Чтение онлайн без скачивания</span>
				</div>
			</div>

			<!-- Флагманский выпуск: Спецвыпуск «Сретенские витражи» -->
			<div class="newspaper-spotlight-card">
				<div class="newspaper-spotlight-mockup">
					<div class="mockup-header">
						<span class="mockup-label">Православная гимназия</span>
						<span class="mockup-title">ДОБРОЕ СЛОВО</span>
						<span class="mockup-meta">Спецвыпуск • 2023 г.</span>
					</div>
					<div class="mockup-body">
						<div class="mockup-cross">☦</div>
						<p class="mockup-snippet">
							Литературно-исторический альманах «Сретенские витражи»
						</p>
					</div>
					<div class="mockup-footer">
						<span>Ковров</span>
						<span>PDF • 63 МБ</span>
					</div>
				</div>

				<div class="newspaper-spotlight-content">
					<span class="newspaper-spotlight-tag">🌟 Исторический спецвыпуск</span>
					<h3 class="newspaper-spotlight-title">Альманах «Сретенские витражи»</h3>
					<p class="newspaper-spotlight-desc">
						Особое юбилейное иллюстрированное издание: летопись гимназической жизни, воспоминания преподавателей, очерки выпускников и избранные исследовательские работы учащихся.
					</p>

					<div class="newspaper-spotlight-actions">
						<button type="button" class="btn-read-pdf" 
								data-pdf="documents/newspaper/Сретенские_витражи_2023.pdf" 
								data-title="Альманах «Сретенские витражи» (Спецвыпуск, 2023)">
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
								<circle cx="12" cy="12" r="3"></circle>
							</svg>
							Читать онлайн
						</button>
						<a href="documents/newspaper/Сретенские_витражи_2023.pdf" download="Сретенские_витражи_2023.pdf" class="btn-download-pdf" title="Скачать альманах в PDF">
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
								<polyline points="7 10 12 15 17 10"></polyline>
								<line x1="12" y1="15" x2="12" y2="3"></line>
							</svg>
							Скачать PDF
						</a>
					</div>
				</div>
			</div>
		</div>

		<!-- Фильтры архива -->
		<div class="newspaper-archive-controls">
			<div class="newspaper-tabs" role="tablist" aria-label="Фильтр архива газеты по годам">
				<button type="button" class="newspaper-tab active" data-year="all">Все выпуски (31)</button>
				<button type="button" class="newspaper-tab" data-year="2023">2023 (Спецвыпуск)</button>
				<button type="button" class="newspaper-tab" data-year="2015">2015 год (3)</button>
				<button type="button" class="newspaper-tab" data-year="2014">2014 год (3)</button>
				<button type="button" class="newspaper-tab" data-year="2013">2013 год (6)</button>
				<button type="button" class="newspaper-tab" data-year="2012">2012 год (9)</button>
				<button type="button" class="newspaper-tab" data-year="2011">2011 год (9)</button>
			</div>

			<div class="newspaper-count-indicator">
				Показано: <strong id="newspaper-visible-count">31</strong> выпуск(ов)
			</div>
		</div>

		<!-- Сетка всех 31 выпусков -->
		<div class="newspaper-grid" id="newspaper-grid">
{grid_content}
		</div>

		<!-- Сноска о школьной библиотеке -->
		<div class="newspaper-footer-note">
			<div class="newspaper-footer-note__icon" aria-hidden="true">📖</div>
			<div class="newspaper-footer-note__text">
				<strong>Школьная библиотека:</strong> печатные подшивки всех 31 номеров газеты «Доброе слово» с первого выпуска 2011 года бережно хранятся в читальном зале библиотеки Православной гимназии и доступны для чтения учащимися, родителями и выпускниками.
			</div>
		</div>

	</section>

	<!-- ВСТРОЕННЫЙ МОДАЛЬНЫЙ ПРОСМОТРЩИК PDF ГАЗЕТЫ -->
	<div class="newspaper-modal" id="newspaper-modal" role="dialog" aria-modal="true" aria-hidden="true" style="display:none;">
		<div class="newspaper-modal__backdrop" id="newspaper-modal-backdrop"></div>
		<div class="newspaper-modal__container">
			<div class="newspaper-modal__header">
				<div class="newspaper-modal__title-wrap">
					<span class="newspaper-modal__icon">📰</span>
					<h3 class="newspaper-modal__title" id="newspaper-modal-title">Просмотр газеты «Доброе слово»</h3>
				</div>
				<div class="newspaper-modal__controls">
					<a href="#" target="_blank" rel="noopener noreferrer" class="newspaper-modal__action-btn" id="newspaper-modal-open-new" title="Открыть в новой вкладке">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
							<polyline points="15 3 21 3 21 9"></polyline>
							<line x1="10" y1="14" x2="21" y2="3"></line>
						</svg>
						<span class="btn-text-desktop">На весь экран</span>
					</a>
					<a href="#" download class="newspaper-modal__action-btn" id="newspaper-modal-download" title="Скачать PDF">
						<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
							<polyline points="7 10 12 15 17 10"></polyline>
							<line x1="12" y1="15" x2="12" y2="3"></line>
						</svg>
						<span class="btn-text-desktop">Скачать</span>
					</a>
					<button type="button" class="newspaper-modal__close-btn" id="newspaper-modal-close" aria-label="Закрыть окно просмотра">
						✕
					</button>
				</div>
			</div>
			<div class="newspaper-modal__body">
				<iframe class="newspaper-modal__iframe" id="newspaper-modal-iframe" src="" title="Просмотр номера газеты в PDF"></iframe>
			</div>
		</div>
	</div>"""

# Replace in life.html
with open('life.html', 'r', encoding='utf-8') as f:
    html = f.read()

import re
old_sec = re.search(r'(<!-- 2\. РАЗДЕЛ: ШКОЛЬНАЯ ГАЗЕТА.*?)(?=<!-- 3\. РАЗДЕЛ: ЛЕТНИЙ|$)', html, re.DOTALL)
if old_sec:
    html = html.replace(old_sec.group(1), new_newspaper_section + "\n\n\t", 1)
    with open('life.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Updated newspaper section in life.html successfully!")
else:
    print("Could not find old newspaper section in life.html")
