(() => {
	const API_URL = `${window.API_BASE_URL}/api/teachers/`;

	const CATEGORY_ORDER = [
		"admins",
		"start_teachers",
		"church",
		"lang",
		"accuracy",
		"naturally",
		"work",
		"other"
	];

	const CATEGORY_TITLES = {
		admins: "Администрация",
		start_teachers: "Учителя начальных классов",
		church: "Духовенство и основы веры",
		lang: "Филология и языки",
		accuracy: "Точные и естественные науки",
		naturally: "Общественные науки и история",
		work: "Труд, спорт, искусство",
		other: "Внеурочная деятельность и сопровождение"
	};

	function escapeHtml(text) {
		return String(text ?? "")
			.replaceAll("&", "&amp;")
			.replaceAll("<", "&lt;")
			.replaceAll(">", "&gt;")
			.replaceAll('"', "&quot;")
			.replaceAll("'", "&#039;");
	}

	function resolvePhotoUrl(photo) {
		if (!photo) return "";
		if (photo.startsWith("http")) return photo;
		if (photo.startsWith("/uploads")) {
			return window.API_BASE_URL ? `${window.API_BASE_URL}${photo}` : photo.replace(/^\//, "");
		}
		return photo.startsWith("/") ? photo.slice(1) : photo;
	}

	function formatExperience(years) {
		if (years === null || years === undefined || years === "") return "";
		const n = Math.abs(Number(years));
		if (!Number.isFinite(n)) return "";
		const mod100 = n % 100;
		const mod10 = n % 10;
		let unit = "лет";
		if (mod100 < 11 || mod100 > 14) {
			if (mod10 === 1) unit = "год";
			else if (mod10 >= 2 && mod10 <= 4) unit = "года";
		}
		return `Стаж ${n} ${unit}`;
	}

	function formatPeopleCount(count) {
		const n = Math.abs(Number(count)) || 0;
		const mod100 = n % 100;
		const mod10 = n % 10;
		if (mod100 < 11 || mod100 > 14) {
			if (mod10 >= 2 && mod10 <= 4) return `${n} человека`;
		}
		return `${n} человек`;
	}

	function getFullName(teacher) {
		return [teacher.last_name, teacher.first_name, teacher.middle_name]
			.filter(Boolean)
			.join(" ");
	}

	function createTeacherCardHtml(teacher) {
		const fullName = escapeHtml(getFullName(teacher));
		const position = escapeHtml(teacher.position);
		const photoUrl = escapeHtml(resolvePhotoUrl(teacher.photo));
		const guidanceHtml = teacher.classroom_guidance
			? `<div class="teacher-card__role-tag teacher-card__role-tag--orange">${escapeHtml(teacher.classroom_guidance)}</div>`
			: "";

		const expText = formatExperience(teacher.experience_years);
		const expBadgeHtml = expText
			? `<span class="info-badge info-badge--blue">${escapeHtml(expText)}</span>`
			: "";
		const qualBadgeHtml = teacher.qualification
			? `<span class="info-badge info-badge--blue-light">${escapeHtml(teacher.qualification)}</span>`
			: "";

		const hasFooter = Boolean(expBadgeHtml || qualBadgeHtml);
		const footerHtml = hasFooter
			? `<div class="teacher-card__footer">${expBadgeHtml}${qualBadgeHtml}</div>`
			: "";

		return `
			<article class="teacher-card">
				<div class="teacher-card__photo-container">
					<img loading="lazy" decoding="async" src="${photoUrl}" alt="${fullName}" class="teacher-card__photo">
					${guidanceHtml}
				</div>
				<div class="teacher-card__body">
					<h3 class="teacher-card__name">${fullName}</h3>
					<p class="teacher-card__position">${position}</p>
					${footerHtml}
				</div>
			</article>
		`;
	}

	function renderTeachers(container, teachersList) {
		if (!teachersList || teachersList.length === 0) {
			container.innerHTML = `<div class="teachers-status-message">Список преподавателей пока пуст.</div>`;
			return [];
		}

		const grouped = new Map();
		CATEGORY_ORDER.forEach(cat => grouped.set(cat, []));

		teachersList.forEach(teacher => {
			const cat = CATEGORY_TITLES[teacher.category] ? teacher.category : "other";
			grouped.get(cat).push(teacher);
		});

		const sectionsHtml = [];
		const activeCategories = new Set();

		CATEGORY_ORDER.forEach(catKey => {
			const items = grouped.get(catKey);
			if (!items || items.length === 0) return;

			activeCategories.add(catKey);
			const cardsHtml = items.map(createTeacherCardHtml).join("");
			sectionsHtml.push(`
				<section class="teachers-group" data-category="${catKey}">
					<div class="group-header">
						<h2 class="group-header__title">${escapeHtml(CATEGORY_TITLES[catKey])}</h2>
						<span class="group-header__count">${escapeHtml(formatPeopleCount(items.length))}</span>
					</div>
					<div class="teachers-grid">${cardsHtml}</div>
				</section>
			`);
		});

		container.innerHTML = sectionsHtml.join("");

		// Hide category pills and quick-nav buttons that currently have 0 teachers
		document.querySelectorAll(".filter-pills .pill-btn[data-category]").forEach(btn => {
			btn.style.display = activeCategories.has(btn.dataset.category) ? "" : "none";
		});
		document.querySelectorAll(".teachers-quick-nav__item[data-nav-category]").forEach(item => {
			const li = item.closest("li");
			if (li) {
				li.style.display = activeCategories.has(item.dataset.navCategory) ? "" : "none";
			}
		});

		return Array.from(container.querySelectorAll(".teachers-group"));
	}

	document.addEventListener("DOMContentLoaded", () => {
		const container = document.getElementById("teachers-container") || document.querySelector(".teachers-container");
		const filterBtns = document.querySelectorAll(".filter-pills .pill-btn");
		const filterPills = document.querySelector(".filter-pills");
		const searchInput = document.querySelector(".search-box__input");

		// Horizontal wheel scroll on filter pills
		if (filterPills) {
			filterPills.addEventListener("wheel", (e) => {
				if (e.deltaY !== 0) {
					e.preventDefault();
					filterPills.scrollBy({
						left: e.deltaY * 2.5,
						behavior: "smooth"
					});
				}
			}, { passive: false });
		}

		// IntersectionObserver for dynamic sections and static footer blocks
		const observer = new IntersectionObserver(
			(entries, obs) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-visible");
						obs.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.08 }
		);

		document.querySelectorAll(".feedback, .faq, footer").forEach(element => {
			element.classList.add("animate-on-scroll");
			observer.observe(element);
		});

		function observeTeacherSections(sections) {
			sections.forEach(section => {
				section.classList.add("animate-on-scroll");
				observer.observe(section);
			});
		}

		function applyCategoryFilter(selectedBtn) {
			const sections = container ? Array.from(container.querySelectorAll(".teachers-group")) : [];
			if (!sections.length) return;

			const firstPositions = new Map();
			sections.forEach(sec => firstPositions.set(sec, sec.getBoundingClientRect().top));

			filterBtns.forEach(b => b.classList.remove("pill-btn--active"));
			selectedBtn.classList.add("pill-btn--active");

			const category = selectedBtn.dataset.category;
			sections.forEach(section => {
				if (!category) {
					section.style.order = "0";
					section.style.opacity = "1";
				} else if (section.dataset.category === category) {
					section.style.order = "-1";
					section.style.opacity = "1";
				} else {
					section.style.order = "0";
				}
			});

			sections.forEach(sec => {
				const firstTop = firstPositions.get(sec);
				const lastTop = sec.getBoundingClientRect().top;
				const deltaY = firstTop - lastTop;
				if (deltaY !== 0) {
					sec.animate(
						[{ transform: `translateY(${deltaY}px)` }, { transform: "translateY(0)" }],
						{ duration: 450, easing: "cubic-bezier(0.2, 0, 0, 1)" }
					);
				}
			});

			if (container) {
				container.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		}

		filterBtns.forEach(btn => {
			btn.addEventListener("click", () => {
				if (btn.classList.contains("pill-btn--active")) return;
				applyCategoryFilter(btn);
			});
		});

		function applySearchFilter(query) {
			const sections = container ? Array.from(container.querySelectorAll(".teachers-group")) : [];
			sections.forEach(section => {
				const cards = section.querySelectorAll(".teacher-card");
				let hasVisibleCards = false;

				cards.forEach(card => {
					const name = card.querySelector(".teacher-card__name")?.textContent.toLowerCase() || "";
					const position = card.querySelector(".teacher-card__position")?.textContent.toLowerCase() || "";
					const roleTag = card.querySelector(".teacher-card__role-tag")?.textContent.toLowerCase() || "";
					const footerTags = card.querySelector(".teacher-card__footer")?.textContent.toLowerCase() || "";

					const isMatch = name.includes(query) || position.includes(query) || roleTag.includes(query) || footerTags.includes(query);

					if (isMatch) {
						hasVisibleCards = true;
						card.style.display = "";
						requestAnimationFrame(() => card.classList.remove("teacher-card--hidden"));
					} else {
						card.classList.add("teacher-card--hidden");
						setTimeout(() => {
							if (card.classList.contains("teacher-card--hidden")) {
								card.style.display = "none";
							}
						}, 300);
					}
				});

				if (hasVisibleCards) {
					section.style.display = "";
				} else {
					setTimeout(() => {
						if (!section.querySelector(".teacher-card:not(.teacher-card--hidden)")) {
							section.style.display = "none";
						}
					}, 300);
				}
			});
		}

		if (searchInput) {
			searchInput.addEventListener("input", (e) => {
				applySearchFilter(e.target.value.toLowerCase().trim());
			});
		}

		// Quick navigation drawer setup
		const quickNav = document.getElementById("teachersQuickNav");
		const toggleBtn = document.getElementById("teachersNavToggle");
		const closeBtn = document.getElementById("teachersNavClose");
		const panel = document.getElementById("teachersNavMenu");
		const navItems = document.querySelectorAll(".teachers-quick-nav__item");
		let isQuickNavOpen = false;

		function openNav() {
			if (!panel || !toggleBtn) return;
			isQuickNavOpen = true;
			panel.classList.add("teachers-quick-nav__panel--open");
			toggleBtn.classList.add("teachers-quick-nav__toggle--active");
			toggleBtn.setAttribute("aria-expanded", "true");
		}

		function closeNav() {
			if (!panel || !toggleBtn) return;
			isQuickNavOpen = false;
			panel.classList.remove("teachers-quick-nav__panel--open");
			toggleBtn.classList.remove("teachers-quick-nav__toggle--active");
			toggleBtn.setAttribute("aria-expanded", "false");
		}

		if (quickNav && toggleBtn && panel) {
			toggleBtn.addEventListener("click", (e) => {
				e.stopPropagation();
				if (isQuickNavOpen) closeNav();
				else openNav();
			});

			closeBtn?.addEventListener("click", (e) => {
				e.stopPropagation();
				closeNav();
			});

			document.addEventListener("click", (e) => {
				if (isQuickNavOpen && !quickNav.contains(e.target)) {
					closeNav();
				}
			});

			document.addEventListener("keydown", (e) => {
				if (e.key === "Escape" && isQuickNavOpen) {
					closeNav();
					toggleBtn.focus();
				}
			});

			navItems.forEach(item => {
				item.addEventListener("click", () => {
					const category = item.dataset.navCategory;
					const targetSection = document.querySelector(`.teachers-group[data-category="${category}"]`);
					if (!targetSection) return;

					const allPill = document.querySelector(".filter-pills .pill-btn:first-child");
					const activePill = document.querySelector(".filter-pills .pill-btn--active");
					if (activePill && allPill && activePill !== allPill && activePill.dataset.category !== category) {
						allPill.click();
					}

					const header = document.querySelector("header");
					const headerH = header ? header.offsetHeight : 100;
					const rect = targetSection.getBoundingClientRect();
					const targetY = rect.top + window.scrollY - headerH - 24;

					window.scrollTo({
						top: Math.max(0, targetY),
						behavior: "smooth"
					});

					if (window.innerWidth <= 768) {
						closeNav();
					}
				});
			});

			let ticking = false;
			function updateActiveCategory() {
				const sections = container ? Array.from(container.querySelectorAll(".teachers-group")) : [];
				if (!sections.length) {
					ticking = false;
					return;
				}

				const scrollY = window.scrollY;
				const header = document.querySelector("header");
				const headerH = (header ? header.offsetHeight : 100) + 60;
				let currentCategory = sections[0].dataset.category;

				sections.forEach(sec => {
					if (sec.style.display === "none") return;
					const top = sec.offsetTop - headerH;
					const height = sec.offsetHeight;
					if (scrollY >= top && scrollY < top + height) {
						currentCategory = sec.dataset.category;
					}
				});

				const isBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 60);
				if (isBottom) {
					const visibleSections = sections.filter(s => s.style.display !== "none");
					if (visibleSections.length > 0) {
						currentCategory = visibleSections[visibleSections.length - 1].dataset.category;
					}
				}

				navItems.forEach(item => {
					item.classList.toggle("teachers-quick-nav__item--active", item.dataset.navCategory === currentCategory);
				});

				ticking = false;
			}

			window.addEventListener("scroll", () => {
				if (!ticking) {
					requestAnimationFrame(updateActiveCategory);
					ticking = true;
				}
			}, { passive: true });
		}

		async function loadTeachers() {
			if (!container) return;
			container.innerHTML = `<div class="teachers-status-message">Загрузка списка преподавателей...</div>`;

			try {
				const response = await fetch(API_URL);
				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}
				const teachersList = await response.json();
				const sections = renderTeachers(container, teachersList);
				observeTeacherSections(sections);
				if (searchInput && searchInput.value.trim()) {
					applySearchFilter(searchInput.value.toLowerCase().trim());
				}
			} catch (error) {
				console.error("Ошибка загрузки учителей:", error);
				container.innerHTML = `
					<div class="teachers-status-message teachers-status-message--error">
						<p>Не удалось загрузить список преподавателей. Проверьте подключение к серверу.</p>
						<button type="button" class="teachers-status-retry" id="teachers-retry-btn">Повторить</button>
					</div>
				`;
				document.getElementById("teachers-retry-btn")?.addEventListener("click", loadTeachers);
			}
		}

		loadTeachers();
	});
})();
