# Update life.html
with open('life.html', 'r', encoding='utf-8') as f:
    html = f.read()

target_media = """				<div class="club-card-major__media">
					<img src="assets/images/clubs/theater-stage-1.webp" alt="Постановка театральной студии «Встреча» на сцене гимназии" width="450" height="300" loading="lazy">
					<div class="club-card-major__media-caption">
						Воспитанники студии регулярно становятся лауреатами театральных конкурсов
					</div>
				</div>"""

new_media = """				<div class="club-card-major__media">
					<div class="theatre-gallery">
						<div class="theatre-gallery__main-wrap">
							<img src="assets/images/clubs/theater/theater-1.webp" 
								 alt="Спектакль «Белый Ангел Москвы»" 
								 id="theatre-main-img" 
								 class="theatre-gallery__main-img" 
								 width="450" height="290" loading="lazy">
							<span class="theatre-gallery__badge">
								<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
									<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
									<circle cx="8.5" cy="8.5" r="1.5"></circle>
									<polyline points="21 15 16 10 5 21"></polyline>
								</svg>
								Фотоархив студии
							</span>
						</div>

						<div class="theatre-gallery__caption" id="theatre-main-caption">
							Спектакль «Белый Ангел Москвы» (о великой княгине Елисавете Феодоровне)
						</div>

						<!-- Миниатюры для интерактивного переключения -->
						<div class="theatre-gallery__thumbs" role="tablist" aria-label="Фотографии спектаклей">
							<button type="button" class="theatre-gallery__thumb active" 
									data-src="assets/images/clubs/theater/theater-1.webp" 
									data-caption="Спектакль «Белый Ангел Москвы» (о великой княгине Елисавете Феодоровне)"
									aria-label="Белый Ангел Москвы">
								<img src="assets/images/clubs/theater/theater-1.webp" alt="Белый Ангел Москвы" loading="lazy">
							</button>

							<button type="button" class="theatre-gallery__thumb" 
									data-src="assets/images/clubs/theater/theater-2.webp" 
									data-caption="Военно-патриотическая постановка «Апрель 45-го» ко Дню Победы"
									aria-label="Апрель 45-го">
								<img src="assets/images/clubs/theater/theater-2.webp" alt="Апрель 45-го" loading="lazy">
							</button>

							<button type="button" class="theatre-gallery__thumb" 
									data-src="assets/images/clubs/theater/theater-3.webp" 
									data-caption="Премьера спектакля «Принцесса Кру» на сцене гимназии"
									aria-label="Принцесса Кру">
								<img src="assets/images/clubs/theater/theater-3.webp" alt="Принцесса Кру" loading="lazy">
							</button>

							<button type="button" class="theatre-gallery__thumb" 
									data-src="assets/images/clubs/theater/theater-4.webp" 
									data-caption="Сцена из спектакля «Можно спросить Нину?» по К. Булычеву"
									aria-label="Можно спросить Нину?">
								<img src="assets/images/clubs/theater/theater-4.webp" alt="Можно спросить Нину?" loading="lazy">
							</button>

							<button type="button" class="theatre-gallery__thumb" 
									data-src="assets/images/clubs/theater/theater-5.webp" 
									data-caption="Юные артисты студии «Встреча» в сценических образах"
									aria-label="Юные артисты в костюмах">
								<img src="assets/images/clubs/theater/theater-5.webp" alt="Юные артисты" loading="lazy">
							</button>

							<button type="button" class="theatre-gallery__thumb" 
									data-src="assets/images/clubs/theater/theater-diploma.webp" 
									data-caption="Диплом лауреатов театрального фестиваля «Мельпомена в школьной форме»"
									aria-label="Диплом студии">
								<img src="assets/images/clubs/theater/theater-diploma.webp" alt="Диплом студии" loading="lazy">
							</button>
						</div>

						<a href="https://vkvideo.ru/video-178231686_456239608?t=16m" target="_blank" rel="noopener noreferrer" class="theatre-video-link">
							<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<polygon points="5 3 19 12 5 21 5 3"></polygon>
							</svg>
							Смотреть видеозаписи спектаклей (VK Видео)
						</a>
					</div>
				</div>"""

if target_media in html:
    html = html.replace(target_media, new_media, 1)
    print("Replaced theater media with interactive gallery")
else:
    print("Could not find target_media")

# Bump cache version in life.html
html = html.replace('href="css/style.css?v=2.5"', 'href="css/style.css?v=2.6"')
html = html.replace('src="./js/life.js"', 'src="./js/life.js?v=2.6"')

with open('life.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Saved life.html")

# Update js/life.js
with open('js/life.js', 'r', encoding='utf-8') as f:
    js = f.read()

gallery_func = """
// ========================================
// Интерактивная галерея студии «Встреча»
// ========================================
function initTheatreGallery() {
	const thumbs = document.querySelectorAll(".theatre-gallery__thumb");
	const mainImg = document.getElementById("theatre-main-img");
	const caption = document.getElementById("theatre-main-caption");
	if (!thumbs.length || !mainImg || !caption) return;

	thumbs.forEach((thumb) => {
		thumb.addEventListener("click", () => {
			if (thumb.classList.contains("active")) return;
			thumbs.forEach((t) => t.classList.remove("active"));
			thumb.classList.add("active");

			const nextSrc = thumb.getAttribute("data-src");
			const nextCaption = thumb.getAttribute("data-caption");

			mainImg.style.opacity = "0.4";
			setTimeout(() => {
				mainImg.src = nextSrc;
				mainImg.alt = nextCaption || "";
				caption.textContent = nextCaption || "";
				mainImg.style.opacity = "1";
			}, 130);
		});
	});
}

initTheatreGallery();
"""

if "function initTheatreGallery()" not in js:
    # insert before })(); at end of file
    if js.rstrip().endswith("})();"):
        idx = js.rfind("})();")
        js = js[:idx] + gallery_func + "\n})();\n"
        with open('js/life.js', 'w', encoding='utf-8') as f:
            f.write(js)
        print("Added initTheatreGallery to js/life.js")
    else:
        print("Could not find })(); at end of js/life.js")
else:
    print("initTheatreGallery already in js/life.js")
