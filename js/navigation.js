/**
 * navigation.js — Навигация сайта ЧОУ «Православная гимназия г. Коврова»
 * Поддерживает:
 * 1. Десктопное мегаменю («Учеба», «Родителям»)
 * 2. Сенсорное мобильное Off-canvas Drawer меню (аккордеоны, поиск, БВИ, scroll-lock, a11y)
 */

(function () {
	// ---------------------------------------------------------
	// Вспомогательное разрешение путей (для корня и подпапок /sveden/)
	// ---------------------------------------------------------
	function resolvePath(path) {
		if (!path || path.startsWith("http") || path.startsWith("#") || path.startsWith("/")) {
			return path;
		}
		const isSubdir = window.location.pathname.includes("/sveden/") || window.location.pathname.includes("\\sveden\\");
		return isSubdir ? "../" + path : path;
	}

	// ---------------------------------------------------------
	// ДАННЫЕ МЕНЮ
	// ---------------------------------------------------------
	const menuData = {
		study: {
			title: "Учеба",
			description: "Всё необходимое для учебного процесса",
			items: [
				{
					title: "Расписание",
					description: "Расписание занятий и звонков",
					icon: "assets/icons/clock.svg",
					link: "class_schedule.html"
				},
				{
					title: "Школьное питание",
					description: "Меню и информация о питании",
					icon: "assets/icons/apple.svg",
					link: "food.html"
				},
				{
					title: "Документы",
					description: "Нормативные и учебные документы",
					icon: "assets/icons/file.svg",
					link: "documents.html"
				}
			]
		},
		parents: {
			title: "Родителям",
			description: "Всё важное для родителей и учеников",
			items: [
				{
					title: "Электронный дневник",
					description: "Успеваемость и оценки",
					icon: "assets/icons/dairy.svg",
					link: "dairy.html"
				},
				{
					title: "Частые вопросы",
					description: "Ответы на популярные вопросы",
					icon: "assets/icons/parants.svg",
					link: "#faq"
				},
				{
					title: "Учителя",
					description: "Педагогический состав гимназии",
					icon: "assets/icons/teacher-outline-regular.svg",
					link: "teachers.html"
				}
			]
		},
		sveden: [
			{ title: "Основные сведения", link: "sveden/common.html" },
			{ title: "Структура и органы управления", link: "sveden/struct.html" },
			{ title: "Документы", link: "sveden/document.html" },
			{ title: "Образование", link: "sveden/education.html" },
			{ title: "Образовательные стандарты", link: "sveden/eduStandarts.html" },
			{ title: "Руководство", link: "sveden/managers.html" },
			{ title: "Педагогический состав", link: "sveden/employees.html" },
			{ title: "Материально-техническое обеспечение", link: "sveden/objects.html" },
			{ title: "Платные образовательные услуги", link: "sveden/paid_edu.html" },
			{ title: "Финансово-хозяйственная деятельность", link: "sveden/budget.html" },
			{ title: "Вакантные места для приема", link: "sveden/vacant.html" },
			{ title: "Стипендии и меры поддержки", link: "sveden/grants.html" },
			{ title: "Доступная среда (ОВЗ)", link: "sveden/objects.html#ovz" },
			{ title: "Международное сотрудничество", link: "sveden/inter.html" },
			{ title: "Организация питания", link: "sveden/catering.html" }
		]
	};

	// ---------------------------------------------------------
	// 1. ДЕСКТОПНОЕ МЕГАМЕНЮ
	// ---------------------------------------------------------
	const megaMenu = document.getElementById("mega-menu");
	const megaOverlay = document.getElementById("mega-overlay");
	const megaMenuContent = document.getElementById("mega-menu-content");
	const megaMenuTitle = document.getElementById("mega-menu-title");
	const megaMenuDescription = document.getElementById("mega-menu-description");
	const megaMenuClose = document.querySelector(".mega-menu__close");
	const megaMenuToggles = document.querySelectorAll(".mega-menu-toggle");

	function renderMegaMenu(type) {
		const data = menuData[type];
		if (!data || !megaMenuContent || !megaMenuTitle) return;

		megaMenuTitle.textContent = data.title;
		if (megaMenuDescription) megaMenuDescription.textContent = data.description;
		megaMenuContent.innerHTML = "";

		data.items.forEach(item => {
			const link = document.createElement("a");
			link.className = "mega-menu__item";
			link.href = resolvePath(item.link);
			link.innerHTML = `
				<span class="mega-menu__icon">
					<img src="${resolvePath(item.icon)}" alt="" width="20" height="20">
				</span>
				<span class="mega-menu__text">
					<strong>${item.title}</strong>
					<small>${item.description}</small>
				</span>
			`;
			link.addEventListener("click", () => {
				closeMegaMenu();
			});
			megaMenuContent.appendChild(link);
		});
	}

	function openMegaMenu(type, toggle) {
		if (!megaMenu || !megaOverlay) return;
		renderMegaMenu(type);
		megaMenu.classList.add("is-open");
		megaOverlay.classList.add("is-visible");

		megaMenuToggles.forEach(button => {
			button.setAttribute("aria-expanded", "false");
			button.classList.remove("is-active");
		});

		toggle.setAttribute("aria-expanded", "true");
		toggle.classList.add("is-active");
	}

	function closeMegaMenu() {
		if (!megaMenu || !megaOverlay) return;
		megaMenu.classList.remove("is-open");
		megaOverlay.classList.remove("is-visible");

		megaMenuToggles.forEach(button => {
			button.setAttribute("aria-expanded", "false");
			button.classList.remove("is-active");
		});
	}

	if (megaMenuToggles.length) {
		megaMenuToggles.forEach(toggle => {
			toggle.addEventListener("click", event => {
				event.stopPropagation();
				const isOpen = megaMenu && megaMenu.classList.contains("is-open") && toggle.getAttribute("aria-expanded") === "true";
				if (isOpen) {
					closeMegaMenu();
					return;
				}
				const type = toggle.textContent.trim().startsWith("Учеба") ? "study" : "parents";
				openMegaMenu(type, toggle);
			});
		});
	}

	if (megaMenuClose) {
		megaMenuClose.addEventListener("click", closeMegaMenu);
	}

	if (megaOverlay) {
		megaOverlay.addEventListener("click", closeMegaMenu);
	}

	document.addEventListener("keydown", event => {
		if (event.key === "Escape") {
			closeMegaMenu();
			closeMobileDrawer();
		}
	});

	document.addEventListener("click", event => {
		if (megaMenu && !megaMenu.contains(event.target)) {
			closeMegaMenu();
		}
	});

	let lastMegaScrollY = window.scrollY;
	window.addEventListener("scroll", () => {
		const currentScrollY = window.scrollY;
		if (Math.abs(currentScrollY - lastMegaScrollY) > 40 && megaMenu && megaMenu.classList.contains("is-open")) {
			closeMegaMenu();
		}
		lastMegaScrollY = currentScrollY;
	}, { passive: true });

	// ---------------------------------------------------------
	// 2. ПОЛНОЦЕННОЕ МОБИЛЬНОЕ OFF-CANVAS МЕНЮ (DRAWER)
	// ---------------------------------------------------------
	let mobileDrawer = null;
	let mobileBackdrop = null;
	let mobileToggleBtn = null;
	let savedScrollY = 0;

	function initMobileNav() {
		const topBarContent = document.querySelector(".top-bar__content");
		if (!topBarContent) return;

		// 1. Создаем блок мобильных кнопок в шапке (БВИ + Гамбургер), если его еще нет
		let actionsContainer = document.getElementById("mobile-header-actions");
		if (!actionsContainer) {
			actionsContainer = document.createElement("div");
			actionsContainer.id = "mobile-header-actions";
			actionsContainer.className = "mobile-header-actions";

			// Кнопка для слабовидящих (видна на всех мобильных экранах по ГОСТ)
			const mobileBviBtn = document.createElement("button");
			mobileBviBtn.id = "mobile-header-bvi-btn";
			mobileBviBtn.className = "mobile-header-bvi-btn";
			mobileBviBtn.type = "button";
			mobileBviBtn.setAttribute("aria-label", "Версия для слабовидящих");
			mobileBviBtn.title = "Версия для слабовидящих";
			mobileBviBtn.innerHTML = `
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true">
					<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
					<circle cx="12" cy="12" r="3"></circle>
				</svg>
			`;
			mobileBviBtn.addEventListener("click", () => {
				const originalBviBtn = document.querySelector(".bvi-toggle-btn");
				if (originalBviBtn) originalBviBtn.click();
			});

			// Кнопка гамбургера
			mobileToggleBtn = document.createElement("button");
			mobileToggleBtn.id = "mobile-menu-toggle-btn";
			mobileToggleBtn.className = "mobile-menu-toggle";
			mobileToggleBtn.type = "button";
			mobileToggleBtn.setAttribute("aria-label", "Открыть меню навигации");
			mobileToggleBtn.setAttribute("aria-expanded", "false");
			mobileToggleBtn.setAttribute("aria-controls", "mobile-drawer");
			mobileToggleBtn.innerHTML = `
				<span class="mobile-menu-toggle__box" aria-hidden="true">
					<span class="mobile-menu-toggle__line"></span>
					<span class="mobile-menu-toggle__line"></span>
					<span class="mobile-menu-toggle__line"></span>
				</span>
			`;

			actionsContainer.appendChild(mobileBviBtn);
			actionsContainer.appendChild(mobileToggleBtn);
			topBarContent.appendChild(actionsContainer);
		} else {
			mobileToggleBtn = document.getElementById("mobile-menu-toggle-btn");
		}

		// 2. Создаем подложку-оверлей
		if (!document.getElementById("mobile-drawer-backdrop")) {
			mobileBackdrop = document.createElement("div");
			mobileBackdrop.id = "mobile-drawer-backdrop";
			mobileBackdrop.className = "mobile-drawer-backdrop";
			mobileBackdrop.setAttribute("aria-hidden", "true");
			document.body.appendChild(mobileBackdrop);
		} else {
			mobileBackdrop = document.getElementById("mobile-drawer-backdrop");
		}

		// 3. Создаем выдвижное меню (Drawer)
		if (!document.getElementById("mobile-drawer")) {
			mobileDrawer = document.createElement("aside");
			mobileDrawer.id = "mobile-drawer";
			mobileDrawer.className = "mobile-drawer";
			mobileDrawer.setAttribute("role", "dialog");
			mobileDrawer.setAttribute("aria-modal", "true");
			mobileDrawer.setAttribute("aria-label", "Мобильное меню");

			// Построение контента шторки
			mobileDrawer.innerHTML = `
				<div class="mobile-drawer__header">
					<a href="${resolvePath('index.html')}" class="mobile-drawer__brand">
						<img src="${resolvePath('assets/icons/logo_star.png')}" alt="" class="mobile-drawer__logo" width="36" height="36">
						<div class="mobile-drawer__brand-info">
							<span class="mobile-drawer__brand-title">Гимназия г. Коврова</span>
							<span class="mobile-drawer__brand-sub">Официальный сайт</span>
						</div>
					</a>
					<button type="button" class="mobile-drawer__close" id="mobile-drawer-close-btn" aria-label="Закрыть меню">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</div>

				<div class="mobile-drawer__search">
					<form class="mobile-search-form" action="${resolvePath('search.html')}" method="get">
						<img src="${resolvePath('assets/icons/search.svg')}" alt="" width="18" height="18">
						<input type="search" name="q" placeholder="Поиск по сайту..." autocomplete="off" aria-label="Поиск по сайту">
						<button type="submit" class="mobile-search-btn" aria-label="Искать">Найти</button>
					</form>
				</div>

				<nav class="mobile-drawer__nav" aria-label="Мобильная навигация">
					<ul class="mobile-drawer__list">
						<li class="mobile-drawer__item">
							<a href="${resolvePath('index.html')}" class="mobile-drawer__link">
								<span>Главная</span>
							</a>
						</li>

						<!-- СВЕДЕНИЯ С АККОРДЕОНОМ -->
						<li class="mobile-drawer__item mobile-drawer__item--has-sub">
							<div class="mobile-drawer__item-head">
								<a href="${resolvePath('sveden/index.html')}" class="mobile-drawer__link mobile-drawer__link--main">
									<span>Сведения об организации</span>
								</a>
								<button type="button" class="mobile-drawer__sub-toggle" aria-expanded="false" aria-label="Раскрыть подразделы сведений">
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
								</button>
							</div>
							<ul class="mobile-drawer__sub-list">
								<li class="mobile-drawer__sub-item"><a href="${resolvePath('sveden/index.html')}" class="mobile-drawer__sub-link mobile-drawer__sub-link--hub">Все 15 подразделов (Хаб)</a></li>
								${menuData.sveden.map(s => `
									<li class="mobile-drawer__sub-item"><a href="${resolvePath(s.link)}" class="mobile-drawer__sub-link">${s.title}</a></li>
								`).join("")}
							</ul>
						</li>

						<!-- УЧЕБА С АККОРДЕОНОМ -->
						<li class="mobile-drawer__item mobile-drawer__item--has-sub">
							<div class="mobile-drawer__item-head">
								<span class="mobile-drawer__link mobile-drawer__link--main">
									<span>Учеба</span>
								</span>
								<button type="button" class="mobile-drawer__sub-toggle" aria-expanded="false" aria-label="Раскрыть разделы учебы">
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
								</button>
							</div>
							<ul class="mobile-drawer__sub-list">
								${menuData.study.items.map(it => `
									<li class="mobile-drawer__sub-item">
										<a href="${resolvePath(it.link)}" class="mobile-drawer__sub-link">
											<strong>${it.title}</strong>
											<small>${it.description}</small>
										</a>
									</li>
								`).join("")}
							</ul>
						</li>

						<li class="mobile-drawer__item">
							<a href="${resolvePath('life.html')}" class="mobile-drawer__link">
								<span>Жизнь гимназии</span>
							</a>
						</li>

						<!-- РОДИТЕЛЯМ С АККОРДЕОНОМ -->
						<li class="mobile-drawer__item mobile-drawer__item--has-sub">
							<div class="mobile-drawer__item-head">
								<span class="mobile-drawer__link mobile-drawer__link--main">
									<span>Родителям</span>
								</span>
								<button type="button" class="mobile-drawer__sub-toggle" aria-expanded="false" aria-label="Раскрыть разделы для родителей">
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
								</button>
							</div>
							<ul class="mobile-drawer__sub-list">
								${menuData.parents.items.map(it => `
									<li class="mobile-drawer__sub-item">
										<a href="${resolvePath(it.link)}" class="mobile-drawer__sub-link">
											<strong>${it.title}</strong>
											<small>${it.description}</small>
										</a>
									</li>
								`).join("")}
							</ul>
						</li>

						<li class="mobile-drawer__item">
							<a href="${resolvePath('apply.html')}" class="mobile-drawer__link">
								<span>Поступающим</span>
							</a>
						</li>

						<li class="mobile-drawer__item">
							<a href="${resolvePath('contact.html')}" class="mobile-drawer__link">
								<span>Контакты</span>
							</a>
						</li>
					</ul>
				</nav>

				<div class="mobile-drawer__footer">
					<!-- Кнопка версии для слабовидящих -->
					<button type="button" class="mobile-drawer__bvi-btn" id="mobile-drawer-bvi-btn" aria-label="Версия для слабовидящих">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
							<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
							<circle cx="12" cy="12" r="3"></circle>
						</svg>
						<span>Версия для слабовидящих</span>
					</button>

					<!-- Быстрые контакты -->
					<div class="mobile-drawer__contacts">
						<a href="tel:+74923221847" class="mobile-drawer__phone">
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
							<span>+7 (49232) 2-18-47</span>
						</a>
						<p class="mobile-drawer__address">г. Ковров, ул. Подлесная, д. 10</p>
					</div>
				</div>
			`;

			document.body.appendChild(mobileDrawer);
		} else {
			mobileDrawer = document.getElementById("mobile-drawer");
		}

		// Подключение обработчиков событий шторки
		mobileToggleBtn.addEventListener("click", () => {
			const isOpen = mobileDrawer.classList.contains("is-open");
			if (isOpen) closeMobileDrawer();
			else openMobileDrawer();
		});

		mobileBackdrop.addEventListener("click", closeMobileDrawer);

		const closeBtn = document.getElementById("mobile-drawer-close-btn");
		if (closeBtn) closeBtn.addEventListener("click", closeMobileDrawer);

		// Аккордеоны подразделов
		const subToggles = mobileDrawer.querySelectorAll(".mobile-drawer__sub-toggle");
		subToggles.forEach(btn => {
			btn.addEventListener("click", e => {
				e.preventDefault();
				e.stopPropagation();
				const item = btn.closest(".mobile-drawer__item--has-sub");
				const isExpanded = btn.getAttribute("aria-expanded") === "true";
				btn.setAttribute("aria-expanded", String(!isExpanded));
				item.classList.toggle("is-expanded", !isExpanded);
			});
		});

		// Закрытие при клике по любой навигационной ссылке
		const drawerLinks = mobileDrawer.querySelectorAll("a");
		drawerLinks.forEach(link => {
			link.addEventListener("click", () => {
				closeMobileDrawer();
			});
		});

		// Переключатель БВИ внутри шторки
		const bviDrawerBtn = document.getElementById("mobile-drawer-bvi-btn");
		if (bviDrawerBtn) {
			bviDrawerBtn.addEventListener("click", () => {
				closeMobileDrawer();
				const originalBviBtn = document.querySelector(".bvi-toggle-btn");
				if (originalBviBtn) {
					originalBviBtn.click();
				}
			});
		}

		// Автозакрытие при изменении размера экрана на десктоп
		window.addEventListener("resize", () => {
			if (window.innerWidth >= 1024 && mobileDrawer && mobileDrawer.classList.contains("is-open")) {
				closeMobileDrawer();
			}
		});
	}

	function openMobileDrawer() {
		if (!mobileDrawer || !mobileBackdrop) return;
		savedScrollY = window.scrollY;

		mobileDrawer.classList.add("is-open");
		mobileBackdrop.classList.add("is-visible");
		if (mobileToggleBtn) {
			mobileToggleBtn.setAttribute("aria-expanded", "true");
			mobileToggleBtn.classList.add("is-active");
		}

		// Блокировка скролла фона без скачков
		document.body.classList.add("mobile-drawer-open");
		document.body.style.top = `-${savedScrollY}px`;

		// Фокусируемся на кнопке закрытия для a11y
		const closeBtn = document.getElementById("mobile-drawer-close-btn");
		if (closeBtn) closeBtn.focus();
	}

	function closeMobileDrawer() {
		if (!mobileDrawer || !mobileBackdrop) return;
		if (!mobileDrawer.classList.contains("is-open")) return;

		mobileDrawer.classList.remove("is-open");
		mobileBackdrop.classList.remove("is-visible");
		if (mobileToggleBtn) {
			mobileToggleBtn.setAttribute("aria-expanded", "false");
			mobileToggleBtn.classList.remove("is-active");
		}

		// Восстановление скролла фона
		document.body.classList.remove("mobile-drawer-open");
		const scrollY = parseInt(document.body.style.top || "0", 10) * -1;
		document.body.style.top = "";
		window.scrollTo(0, scrollY || savedScrollY);

		if (mobileToggleBtn) mobileToggleBtn.focus();
	}

	// Инициализация при готовности DOM
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initMobileNav);
	} else {
		initMobileNav();
	}

	// Экспорт в глобальную область при необходимости
	window.openMobileNav = openMobileDrawer;
	window.closeMobileNav = closeMobileDrawer;
})();
