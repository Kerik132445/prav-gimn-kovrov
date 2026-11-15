# 1. Update css/style.css to remove underlines and style load-more button
with open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

fix_css = """
/* ========================================================
   ИСПРАВЛЕНИЕ: УДАЛЕНИЕ ВСЕХ ПОДЧЁРКИВАНИЙ И КНОПКА «ЕЩЁ (+4)»
   ======================================================== */
.newspaper-card,
.newspaper-card a,
.newspaper-card__cover,
.newspaper-card__cover *,
.newspaper-spotlight-mockup,
.newspaper-spotlight-mockup *,
.newspaper-spotlight-card a,
.btn-read-issue,
.btn-read-pdf,
.btn-download-pdf,
.btn-download-icon,
.newspaper-tab,
.theatre-video-link,
.camp-album-btn {
	text-decoration: none !important;
}

.newspaper-card__cover {
	text-decoration: none !important;
	color: inherit !important;
	display: flex;
	cursor: pointer;
}

.newspaper-card__cover:hover {
	text-decoration: none !important;
}

.cover-school {
	font-size: 7.5px;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	color: #78716C !important;
	text-decoration: none !important;
}

.cover-name {
	font-size: 13px;
	font-weight: 800;
	font-family: Georgia, serif;
	letter-spacing: 0.05em;
	color: #1C1917 !important;
	margin: 1px 0;
	text-decoration: none !important;
}

.cover-meta,
.cover-num {
	color: #B45309 !important;
	text-decoration: none !important;
}

.cover-badge-tag {
	color: #475569 !important;
	text-decoration: none !important;
	display: inline-block;
}

.newspaper-card__title {
	font-size: 16px;
	font-weight: 700;
	color: #0F172A !important;
	margin: 0;
	line-height: 1.3;
}

.newspaper-card__title a {
	color: #0F172A !important;
	text-decoration: none !important;
	transition: color 0.2s ease;
}

.newspaper-card__title a:hover {
	color: #2563EB !important;
	text-decoration: none !important;
}

.btn-read-issue {
	text-decoration: none !important;
}
.btn-read-issue:hover {
	text-decoration: none !important;
}

.mockup-label {
	color: #78716C !important;
	text-decoration: none !important;
}

.mockup-title {
	color: #1C1917 !important;
	text-decoration: none !important;
}

.mockup-meta {
	color: #B45309 !important;
	text-decoration: none !important;
}

.mockup-snippet {
	color: #57534E !important;
	text-decoration: none !important;
}

.mockup-footer span {
	color: #A8A29E !important;
	text-decoration: none !important;
}

/* Кнопка «Показать ещё выпуски (+4)» */
.newspaper-load-more-wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	margin-top: 14px;
	width: 100%;
}

.newspaper-load-more-btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	background: #EFF6FF;
	color: #1D4ED8;
	border: 1.5px solid #BFDBFE;
	padding: 12px 28px;
	border-radius: 12px;
	font-size: 14px;
	font-weight: 700;
	cursor: pointer;
	box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);
	transition: all 0.2s ease;
}

.newspaper-load-more-btn:hover {
	background: #2563EB;
	border-color: #2563EB;
	color: #FFFFFF;
	transform: translateY(-2px);
	box-shadow: 0 6px 20px rgba(37, 99, 235, 0.2);
}

.newspaper-load-more-btn svg {
	transition: transform 0.2s ease;
}

.newspaper-load-more-btn:hover svg {
	transform: translateY(2px);
}

/* Скрытые карточки до клика «Показать ещё» */
.newspaper-card.newspaper-card--hidden {
	display: none !important;
}

/* Анимация плавного появления */
.newspaper-card.newspaper-card--revealed {
	animation: cardFadeIn 0.35s ease forwards;
}

@keyframes cardFadeIn {
	from {
		opacity: 0;
		transform: translateY(14px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* BVI стили для кнопки */
body.bvi-theme-white .newspaper-load-more-btn {
	background: #FFFFFF !important;
	border: 2px solid #000000 !important;
	color: #000000 !important;
}

body.bvi-theme-black .newspaper-load-more-btn {
	background: #000000 !important;
	border: 2px solid #FFFFFF !important;
	color: #FFFFFF !important;
}
"""

if "/* ИСПРАВЛЕНИЕ: УДАЛЕНИЕ ВСЕХ ПОДЧЁРКИВАНИЙ И КНОПКА «ЕЩЁ (+4)» */" not in css:
    css += "\n" + fix_css
    with open('css/style.css', 'w', encoding='utf-8') as f:
        f.write(css)
    print("Added underline fixes and load-more CSS")
else:
    print("CSS already present")
