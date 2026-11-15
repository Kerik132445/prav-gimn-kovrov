with open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

newspaper_full_css = """
/* ==========================================
   ПОЛНЫЙ МЕДИА-АРХИВ ГАЗЕТЫ «ДОБРОЕ СЛОВО»
   ========================================== */
.newspaper-section {
	background: #FFFFFF;
	border: 1px solid #E2E8F0;
	border-radius: 24px;
	padding: 40px;
	margin-bottom: 56px;
	box-shadow: 0 4px 24px rgba(15, 23, 42, 0.04);
	display: flex;
	flex-direction: column;
	gap: 36px;
}

.newspaper-header-block {
	display: grid;
	grid-template-columns: 1.15fr 1fr;
	gap: 32px;
	align-items: stretch;
}

.newspaper-badges {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 8px;
}

.newspaper-stat-badge {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font-size: 12.5px;
	font-weight: 600;
	color: #0369A1;
	background: #F0F9FF;
	border: 1px solid #BAE6FD;
	padding: 5px 12px;
	border-radius: 6px;
}

/* Флагманский выпуск (Spotlight Card) */
.newspaper-spotlight-card {
	background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
	border: 1.5px solid #FDE68A;
	border-radius: 18px;
	padding: 24px;
	display: grid;
	grid-template-columns: 140px 1fr;
	gap: 20px;
	align-items: center;
	box-shadow: 0 4px 16px rgba(245, 158, 11, 0.08);
}

.newspaper-spotlight-mockup {
	width: 140px;
	height: 195px;
	background: #FCFBF7;
	border: 1px solid #D6D3D1;
	border-radius: 8px;
	padding: 12px 10px;
	box-shadow: 3px 6px 16px rgba(28, 25, 23, 0.12);
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	text-align: center;
	position: relative;
	overflow: hidden;
}

.newspaper-spotlight-mockup::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	width: 4px;
	height: 100%;
	background: #F59E0B;
}

.mockup-label {
	font-size: 8px;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	color: #78716C;
	display: block;
}

.mockup-title {
	font-size: 13px;
	font-weight: 800;
	font-family: Georgia, serif;
	letter-spacing: 0.06em;
	color: #1C1917;
	border-top: 1px solid #D6D3D1;
	border-bottom: 1px solid #D6D3D1;
	padding: 3px 0;
	margin: 3px 0;
	display: block;
}

.mockup-meta {
	font-size: 8.5px;
	font-weight: 600;
	color: #B45309;
	display: block;
}

.mockup-body {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 4px;
	padding: 4px 0;
}

.mockup-cross {
	font-size: 20px;
	color: #D97706;
	line-height: 1;
}

.mockup-snippet {
	font-size: 8.5px;
	line-height: 1.25;
	color: #57534E;
	margin: 0;
}

.mockup-footer {
	font-size: 8px;
	color: #A8A29E;
	border-top: 0.5px dashed #D6D3D1;
	padding-top: 3px;
	display: flex;
	justify-content: space-between;
}

.newspaper-spotlight-content {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.newspaper-spotlight-tag {
	font-size: 11.5px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	color: #B45309;
}

.newspaper-spotlight-title {
	font-size: 20px;
	font-weight: 700;
	color: #1E293B;
	margin: 0;
	line-height: 1.3;
}

.newspaper-spotlight-desc {
	font-size: 13px;
	color: #475569;
	line-height: 1.45;
	margin: 0;
}

.newspaper-spotlight-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 6px;
}

/* Кнопки чтения и скачивания */
.btn-read-pdf {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	background: #D97706;
	color: #FFFFFF;
	border: none;
	padding: 8px 14px;
	border-radius: 8px;
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	transition: background 0.2s ease, transform 0.15s ease;
}

.btn-read-pdf:hover {
	background: #B45309;
	transform: translateY(-1px);
}

.btn-download-pdf {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	background: #FFFFFF;
	color: #78350F;
	border: 1px solid #FCD34D;
	padding: 8px 14px;
	border-radius: 8px;
	font-size: 13px;
	font-weight: 600;
	text-decoration: none;
	transition: all 0.2s ease;
}

.btn-download-pdf:hover {
	background: #FEF3C7;
	border-color: #F59E0B;
}

/* Фильтры архива */
.newspaper-archive-controls {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 16px;
	padding-top: 10px;
	border-top: 1px solid #E2E8F0;
}

.newspaper-tabs {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.newspaper-tab {
	background: #F1F5F9;
	color: #475569;
	border: 1px solid transparent;
	padding: 7px 14px;
	border-radius: 8px;
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
}

.newspaper-tab:hover {
	background: #E2E8F0;
	color: #0F172A;
}

.newspaper-tab.active {
	background: #2563EB;
	color: #FFFFFF;
	box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
}

.newspaper-count-indicator {
	font-size: 13px;
	color: #64748B;
}

.newspaper-count-indicator strong {
	color: #0F172A;
}

/* Сетка карточек */
.newspaper-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	gap: 20px;
}

.newspaper-card {
	background: #FFFFFF;
	border: 1px solid #E2E8F0;
	border-radius: 16px;
	padding: 16px;
	display: flex;
	flex-direction: column;
	gap: 12px;
	transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.newspaper-card:hover {
	transform: translateY(-3px);
	box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
	border-color: #CBD5E1;
}

/* Обложка-макет для каждой карточки */
.newspaper-card__cover {
	background: #FAF7F0;
	border: 1px solid #E7E3D8;
	border-radius: 10px;
	padding: 14px 12px;
	height: 120px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	position: relative;
	overflow: hidden;
}

.cover-masthead {
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
}

.cover-school {
	font-size: 7.5px;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	color: #78716C;
}

.cover-name {
	font-size: 13px;
	font-weight: 800;
	font-family: Georgia, serif;
	letter-spacing: 0.05em;
	color: #1C1917;
	margin: 1px 0;
}

.cover-rule {
	width: 100%;
	height: 1px;
	background: #D6D3D1;
	margin-top: 2px;
}

.cover-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 2px 0;
	font-size: 9px;
	font-weight: 600;
	color: #B45309;
}

.cover-preview-lines {
	display: flex;
	flex-direction: column;
	gap: 3px;
}

.cover-line {
	height: 2.5px;
	background: #E7E5E4;
	border-radius: 2px;
	width: 100%;
}

.cover-line.short {
	width: 70%;
}

.cover-badge-tag {
	align-self: flex-start;
	font-size: 9px;
	font-weight: 700;
	color: #475569;
	background: rgba(255, 255, 255, 0.85);
	padding: 2px 6px;
	border-radius: 4px;
	border: 0.5px solid #D6D3D1;
}

/* Тело карточки */
.newspaper-card__body {
	display: flex;
	flex-direction: column;
	gap: 8px;
	flex-grow: 1;
}

.newspaper-card__header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.newspaper-card__year-badge {
	font-size: 11px;
	font-weight: 700;
	color: #2563EB;
	background: #EFF6FF;
	padding: 2px 8px;
	border-radius: 5px;
}

.newspaper-card__filesize {
	font-size: 11.5px;
	color: #64748B;
	font-weight: 500;
}

.newspaper-card__title {
	font-size: 16px;
	font-weight: 700;
	color: #0F172A;
	margin: 0;
	line-height: 1.3;
}

.newspaper-card__desc {
	font-size: 12.5px;
	color: #475569;
	line-height: 1.45;
	margin: 0;
	flex-grow: 1;
}

.newspaper-card__actions {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-top: 6px;
	padding-top: 10px;
	border-top: 1px solid #F1F5F9;
}

.btn-read-issue {
	flex: 1;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	background: #EFF6FF;
	color: #1D4ED8;
	border: 1px solid #DBEAFE;
	padding: 7px 12px;
	border-radius: 8px;
	font-size: 12.5px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.2s ease;
}

.btn-read-issue:hover {
	background: #2563EB;
	border-color: #2563EB;
	color: #FFFFFF;
}

.btn-download-icon {
	width: 32px;
	height: 32px;
	border-radius: 8px;
	background: #F8FAFC;
	border: 1px solid #E2E8F0;
	color: #475569;
	display: flex;
	align-items: center;
	justify-content: center;
	text-decoration: none;
	transition: all 0.2s ease;
	flex-shrink: 0;
}

.btn-download-icon:hover {
	background: #E2E8F0;
	color: #0F172A;
}

/* Сноска о библиотеке */
.newspaper-footer-note {
	background: #F8FAFC;
	border: 1px solid #E2E8F0;
	border-radius: 12px;
	padding: 14px 18px;
	display: flex;
	align-items: center;
	gap: 12px;
}

.newspaper-footer-note__icon {
	font-size: 24px;
	flex-shrink: 0;
}

.newspaper-footer-note__text {
	font-size: 13px;
	color: #475569;
	line-height: 1.5;
}

.newspaper-footer-note__text strong {
	color: #0F172A;
}

/* ==========================================
   МОДАЛЬНЫЙ ПРОСМОТРЩИК PDF
   ========================================== */
.newspaper-modal {
	position: fixed;
	inset: 0;
	z-index: 99999;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
}

.newspaper-modal__backdrop {
	position: absolute;
	inset: 0;
	background: rgba(15, 23, 42, 0.7);
	backdrop-filter: blur(6px);
	-webkit-backdrop-filter: blur(6px);
}

.newspaper-modal__container {
	position: relative;
	width: 95vw;
	max-width: 1040px;
	height: 90vh;
	background: #FFFFFF;
	border-radius: 18px;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
	animation: modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalSlideUp {
	from {
		opacity: 0;
		transform: translateY(20px) scale(0.98);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

.newspaper-modal__header {
	background: #0F172A;
	color: #FFFFFF;
	padding: 14px 20px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	flex-shrink: 0;
}

.newspaper-modal__title-wrap {
	display: flex;
	align-items: center;
	gap: 10px;
	overflow: hidden;
}

.newspaper-modal__icon {
	font-size: 20px;
	flex-shrink: 0;
}

.newspaper-modal__title {
	font-size: 16px;
	font-weight: 600;
	color: #FFFFFF;
	margin: 0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.newspaper-modal__controls {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-shrink: 0;
}

.newspaper-modal__action-btn {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	background: rgba(255, 255, 255, 0.12);
	color: #FFFFFF;
	border: 1px solid rgba(255, 255, 255, 0.2);
	padding: 6px 12px;
	border-radius: 6px;
	font-size: 12px;
	font-weight: 600;
	text-decoration: none;
	transition: background 0.2s ease;
}

.newspaper-modal__action-btn:hover {
	background: rgba(255, 255, 255, 0.25);
	color: #FFFFFF;
}

.newspaper-modal__close-btn {
	background: transparent;
	border: none;
	color: #94A3B8;
	font-size: 20px;
	width: 32px;
	height: 32px;
	border-radius: 6px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;
}

.newspaper-modal__close-btn:hover {
	background: rgba(255, 255, 255, 0.15);
	color: #FFFFFF;
}

.newspaper-modal__body {
	flex: 1;
	width: 100%;
	height: 100%;
	background: #E2E8F0;
	position: relative;
}

.newspaper-modal__iframe {
	width: 100%;
	height: 100%;
	border: none;
	display: block;
}

/* Адаптивность для архива газеты */
@media (max-width: 900px) {
	.newspaper-header-block {
		grid-template-columns: 1fr;
	}
	
	.newspaper-spotlight-card {
		grid-template-columns: 1fr;
		text-align: center;
		justify-items: center;
	}

	.newspaper-spotlight-actions {
		justify-content: center;
	}

	.btn-text-desktop {
		display: none;
	}
}

@media (max-width: 600px) {
	.newspaper-section {
		padding: 24px 16px;
	}
	
	.newspaper-grid {
		grid-template-columns: 1fr;
	}

	.newspaper-modal {
		padding: 10px;
	}

	.newspaper-modal__container {
		height: 94vh;
	}
}

/* BVI стили для архива газеты */
body.bvi-theme-white .newspaper-section,
body.bvi-theme-white .newspaper-spotlight-card,
body.bvi-theme-white .newspaper-card,
body.bvi-theme-white .newspaper-modal__container {
	background: #FFFFFF !important;
	border-color: #000000 !important;
	color: #000000 !important;
	box-shadow: none !important;
}

body.bvi-theme-white .newspaper-tab,
body.bvi-theme-white .btn-read-pdf,
body.bvi-theme-white .btn-read-issue {
	background: #FFFFFF !important;
	border: 1px solid #000000 !important;
	color: #000000 !important;
}

body.bvi-theme-white .newspaper-tab.active {
	background: #000000 !important;
	color: #FFFFFF !important;
}

body.bvi-theme-black .newspaper-section,
body.bvi-theme-black .newspaper-spotlight-card,
body.bvi-theme-black .newspaper-card,
body.bvi-theme-black .newspaper-modal__container {
	background: #000000 !important;
	border-color: #FFFFFF !important;
	color: #FFFFFF !important;
	box-shadow: none !important;
}

body.bvi-theme-black .newspaper-tab,
body.bvi-theme-black .btn-read-pdf,
body.bvi-theme-black .btn-read-issue {
	background: #000000 !important;
	border: 1px solid #FFFFFF !important;
	color: #FFFFFF !important;
}

body.bvi-theme-black .newspaper-tab.active {
	background: #FFFFFF !important;
	color: #000000 !important;
}
"""

if "/* ПОЛНЫЙ МЕДИА-АРХИВ ГАЗЕТЫ «ДОБРОЕ СЛОВО» */" not in css:
    css += "\n" + newspaper_full_css
    with open('css/style.css', 'w', encoding='utf-8') as f:
        f.write(css)
    print("Added newspaper full archive CSS")
else:
    print("Newspaper archive CSS already present")
