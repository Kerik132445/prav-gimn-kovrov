/**
 * not-found.js — Интерактивность страницы 404 «Путеводная звезда»
 * ЧОУ «Православная гимназия г. Коврова»
 */

(function () {
	document.addEventListener("DOMContentLoaded", () => {
		// 1. Обработка кнопки «Шаг назад»
		const btnBack = document.getElementById("btnBack");
		if (btnBack) {
			btnBack.addEventListener("click", () => {
				if (window.history.length > 1) {
					window.history.back();
				} else {
					window.location.href = "index.html";
				}
			});
		}

		// 2. Обработка встроенного поиска
		const searchForm = document.getElementById("page404-search-form");
		const searchInput = document.getElementById("page404-search-input");
		if (searchForm && searchInput) {
			searchForm.addEventListener("submit", (e) => {
				e.preventDefault();
				const query = searchInput.value.trim();
				if (!query) {
					searchInput.focus();
					return;
				}
				window.location.href = `search.html?q=${encodeURIComponent(query)}`;
			});
		}

		// 3. Интерактивное мягкое следование звезды за курсором (параллакс)
		const heroSection = document.querySelector(".not-found-hero");
		const starPortal = document.getElementById("starPortal");
		const starWrapper = document.querySelector(".star-portal__star-wrapper");

		if (heroSection && starPortal && starWrapper && window.matchMedia("(pointer: fine)").matches) {
			let rafId = null;
			let targetX = 0;
			let targetY = 0;
			let currentX = 0;
			let currentY = 0;

			heroSection.addEventListener("mousemove", (e) => {
				const rect = heroSection.getBoundingClientRect();
				const centerX = rect.left + rect.width / 2;
				const centerY = rect.top + rect.height / 3;

				// Диапазон отклонения до 15px
				targetX = ((e.clientX - centerX) / (rect.width / 2)) * 14;
				targetY = ((e.clientY - centerY) / (rect.height / 2)) * 14;

				if (!rafId) {
					rafId = requestAnimationFrame(updateParallax);
				}
			});

			heroSection.addEventListener("mouseleave", () => {
				targetX = 0;
				targetY = 0;
				if (!rafId) {
					rafId = requestAnimationFrame(updateParallax);
				}
			});

			function updateParallax() {
				currentX += (targetX - currentX) * 0.1;
				currentY += (targetY - currentY) * 0.1;

				starPortal.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

				if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
					rafId = requestAnimationFrame(updateParallax);
				} else {
					rafId = null;
				}
			}

			// Клик по звезде — короткая вспышка сияния
			starPortal.addEventListener("click", () => {
				starPortal.style.transform = "scale(1.22)";
				setTimeout(() => {
					starPortal.style.transform = "";
				}, 300);
			});
		}
	});
})();
