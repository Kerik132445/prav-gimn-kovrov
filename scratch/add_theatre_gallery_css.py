theatre_gallery_css = """
/* ==========================================
   ГАЛЕРЕЯ ТЕАТРАЛЬНОЙ СТУДИИ «ВСТРЕЧА»
   ========================================== */
.theatre-gallery {
	display: flex;
	flex-direction: column;
	gap: 10px;
	width: 100%;
}

.theatre-gallery__main-wrap {
	position: relative;
	width: 100%;
	height: 290px;
	border-radius: 14px;
	overflow: hidden;
	background: #0F172A;
	box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
}

.theatre-gallery__main-img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
	transition: opacity 0.2s ease, transform 0.3s ease;
}

.theatre-gallery__badge {
	position: absolute;
	top: 12px;
	left: 12px;
	background: rgba(15, 23, 42, 0.75);
	backdrop-filter: blur(8px);
	-webkit-backdrop-filter: blur(8px);
	color: #FFFFFF;
	font-size: 11.5px;
	font-weight: 600;
	padding: 4px 10px;
	border-radius: 6px;
	display: flex;
	align-items: center;
	gap: 5px;
	letter-spacing: 0.02em;
}

.theatre-gallery__caption {
	padding: 8px 12px;
	font-size: 13px;
	color: #334155;
	background: #F8FAFC;
	border: 1px solid #E2E8F0;
	border-radius: 8px;
	line-height: 1.4;
	font-weight: 500;
	min-height: 38px;
	display: flex;
	align-items: center;
}

.theatre-gallery__thumbs {
	display: flex;
	gap: 8px;
	overflow-x: auto;
	padding: 4px 2px;
	scrollbar-width: thin;
}

.theatre-gallery__thumb {
	flex: 0 0 62px;
	height: 48px;
	border-radius: 8px;
	border: 2px solid transparent;
	overflow: hidden;
	padding: 0;
	background: #F1F5F9;
	cursor: pointer;
	transition: all 0.2s ease;
	opacity: 0.65;
}

.theatre-gallery__thumb:hover {
	opacity: 0.95;
	transform: translateY(-2px);
}

.theatre-gallery__thumb.active {
	opacity: 1;
	border-color: #F59E0B;
	box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.25);
}

.theatre-gallery__thumb img {
	width: 100%;
	height: 100%;
	object-fit: cover;
	display: block;
}

.theatre-video-link {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 7px;
	background: #FFFBEB;
	color: #B45309;
	border: 1px solid #FDE68A;
	padding: 8px 14px;
	border-radius: 8px;
	font-size: 12.5px;
	font-weight: 600;
	text-decoration: none;
	transition: all 0.2s ease;
	margin-top: 4px;
}

.theatre-video-link:hover {
	background: #FEF3C7;
	border-color: #F59E0B;
	color: #92400E;
}

/* BVI стили */
body.bvi-theme-white .theatre-gallery__caption,
body.bvi-theme-white .theatre-video-link {
	background: #FFFFFF !important;
	border-color: #000000 !important;
	color: #000000 !important;
}

body.bvi-theme-black .theatre-gallery__caption,
body.bvi-theme-black .theatre-video-link {
	background: #000000 !important;
	border-color: #FFFFFF !important;
	color: #FFFFFF !important;
}
"""

with open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

if "/* ГАЛЕРЕЯ ТЕАТРАЛЬНОЙ СТУДИИ «ВСТРЕЧА» */" not in css:
    css += "\n" + theatre_gallery_css
    with open('css/style.css', 'w', encoding='utf-8') as f:
        f.write(css)
    print("Added theatre gallery styles to css/style.css")
else:
    print("Styles already present")
