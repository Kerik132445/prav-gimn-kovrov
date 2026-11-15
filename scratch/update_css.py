with open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

new_styles = """
/* Новые стили для обогащения страницы life.html */
.theatre-quote {
	margin: 0;
	padding: 10px 14px;
	background: #F8FAFC;
	border-left: 3px solid #F59E0B;
	border-radius: 0 8px 8px 0;
	font-size: 13px;
	font-style: italic;
	color: #475569;
	line-height: 1.5;
}

.theatre-quote cite {
	display: block;
	margin-top: 4px;
	font-style: normal;
	font-size: 11.5px;
	font-weight: 600;
	color: #64748B;
	text-align: right;
}

.choir-levels {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
	margin-top: 6px;
}

.choir-level-pill {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	background: #EFF6FF;
	color: #1D4ED8;
	border: 1px solid #DBEAFE;
	padding: 5px 10px;
	border-radius: 6px;
	font-size: 12px;
	font-weight: 600;
}

.choir-schools-note {
	background: #F8FAFC;
	border: 1px solid #E2E8F0;
	border-radius: 8px;
	padding: 10px 14px;
	font-size: 12.5px;
	color: #475569;
	line-height: 1.45;
	margin-top: 6px;
}

.choir-schools-note strong {
	color: #0F172A;
}

.newspaper-archive-links {
	display: flex;
	flex-direction: column;
	gap: 8px;
	width: 100%;
	margin-top: 12px;
}

.newspaper-archive-link {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
	background: #FFFFFF;
	color: #0284C7;
	border: 1px solid #BAE6FD;
	padding: 9px 14px;
	border-radius: 8px;
	font-size: 13px;
	font-weight: 600;
	text-decoration: none;
	transition: all 0.2s ease;
}

.newspaper-archive-link:hover {
	background: #F0F9FF;
	border-color: #0284C7;
	color: #0369A1;
}

.camp-album-btn {
	display: inline-flex;
	align-items: center;
	gap: 8px;
	background: #2563EB;
	color: #FFFFFF;
	padding: 10px 18px;
	border-radius: 8px;
	font-size: 13.5px;
	font-weight: 600;
	text-decoration: none;
	margin-top: 14px;
	align-self: flex-start;
	transition: background 0.2s ease, transform 0.15s ease;
}

.camp-album-btn:hover {
	background: #1D4ED8;
	transform: translateY(-1px);
	color: #FFFFFF;
}

/* BVI стили */
body.bvi-theme-white .theatre-quote,
body.bvi-theme-white .choir-schools-note,
body.bvi-theme-white .newspaper-archive-link {
	background: #FFFFFF !important;
	border-color: #000000 !important;
	color: #000000 !important;
}

body.bvi-theme-black .theatre-quote,
body.bvi-theme-black .choir-schools-note,
body.bvi-theme-black .newspaper-archive-link {
	background: #000000 !important;
	border-color: #FFFFFF !important;
	color: #FFFFFF !important;
}
"""

if "/* Новые стили для обогащения страницы life.html */" not in css:
    css += "\n" + new_styles
    with open('css/style.css', 'w', encoding='utf-8') as f:
        f.write(css)
    print("Added new styles to style.css")
else:
    print("Styles already present")
