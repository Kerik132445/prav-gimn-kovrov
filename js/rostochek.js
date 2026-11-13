/**
 * rostochek.js — Интерактивная логика рекламной страницы Центра «Росточек»
 * ЧОУ «Православная гимназия г. Коврова»
 */
(() => {
	const API_BASE = window.API_BASE_URL || "";
	const ENROLL_ENDPOINT = `${API_BASE}/api/feedback/rostochek`;
	const FALLBACK_ENDPOINT = `${API_BASE}/api/feedback/`;

	// Регулярные выражения для валидации
	const EMAIL_REGEX = /^[\w\.-]+@([\w-]+\.)+[\w-]{2,}$/;
	const PHONE_CHARS_REGEX = /^(\+?[0-9\s\-\(\)]{10,25})$/;

	/* --------------------------------------------------------------------------
	   ОБЩИЕ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ВАЛИДАЦИИ И ОТОБРАЖЕНИЯ ОШИБОК
	   -------------------------------------------------------------------------- */
	function showFieldError(input, message) {
		if (!input) return;
		input.classList.add("rst-input--error");
		input.setAttribute("aria-invalid", "true");
		const group = input.closest(".rst-form-group");
		if (group) {
			let err = group.querySelector(".rst-field-error");
			if (!err) {
				err = document.createElement("span");
				err.className = "rst-field-error";
				err.setAttribute("role", "alert");
				group.appendChild(err);
			}
			err.textContent = message;
			err.style.display = "block";
		}
	}

	function clearFieldError(input) {
		if (!input) return;
		input.classList.remove("rst-input--error");
		input.removeAttribute("aria-invalid");
		const group = input.closest(".rst-form-group");
		if (group) {
			const err = group.querySelector(".rst-field-error");
			if (err) {
				err.textContent = "";
				err.style.display = "none";
			}
		}
	}

	function showConsentError(message) {
		const group = document.querySelector(".rst-consent-row");
		if (group) {
			let err = group.querySelector(".rst-field-error");
			if (!err) {
				err = document.createElement("span");
				err.className = "rst-field-error";
				err.setAttribute("role", "alert");
				group.appendChild(err);
			}
			err.textContent = message;
			err.style.display = "block";
		}
	}

	function clearConsentError() {
		const group = document.querySelector(".rst-consent-row");
		if (group) {
			const err = group.querySelector(".rst-field-error");
			if (err) {
				err.textContent = "";
				err.style.display = "none";
			}
		}
	}

	document.addEventListener("DOMContentLoaded", () => {
		initProgramFilters();
		initProgramEnrollButtons();
		initEnrollForm();
		initScrollReveal();
		initSmoothAnchors();
	});

	/* --------------------------------------------------------------------------
	   1. ФИЛЬТРАЦИЯ ПРОГРАММ ПО КАТЕГОРИЯМ
	   -------------------------------------------------------------------------- */
	function initProgramFilters() {
		const filterButtons = document.querySelectorAll(".rst-filter-btn");
		const programCards = document.querySelectorAll(".rst-program-card");

		if (!filterButtons.length || !programCards.length) return;

		filterButtons.forEach(btn => {
			btn.addEventListener("click", () => {
				const filter = btn.dataset.filter || "all";

				filterButtons.forEach(b => b.classList.remove("rst-filter-btn--active"));
				btn.classList.add("rst-filter-btn--active");

				programCards.forEach(card => {
					const categories = (card.dataset.category || "").split(" ");
					if (filter === "all" || categories.includes(filter)) {
						card.style.display = "flex";
						card.classList.remove("rst-reveal--visible");
						requestAnimationFrame(() => card.classList.add("rst-reveal--visible"));
					} else {
						card.style.display = "none";
					}
				});
			});
		});
	}

	/* --------------------------------------------------------------------------
	   2. КНОПКИ «ЗАПИСАТЬСЯ» НА КАРТОЧКАХ ПРОГРАММ
	   -------------------------------------------------------------------------- */
	function initProgramEnrollButtons() {
		const enrollButtons = document.querySelectorAll(".rst-program-enroll-btn");
		const courseSelect = document.getElementById("enroll-course");
		const parentNameInput = document.getElementById("enroll-parent-name");
		const enrollSection = document.getElementById("enroll-form");

		if (!enrollButtons.length || !courseSelect) return;

		enrollButtons.forEach(btn => {
			btn.addEventListener("click", (e) => {
				const courseName = (btn.dataset.course || "").trim();
				if (courseName && courseSelect) {
					let matchedIndex = -1;

					// 1. Поиск по точному вхождению подстроки
					for (let i = 0; i < courseSelect.options.length; i++) {
						const optVal = courseSelect.options[i].value;
						const optText = courseSelect.options[i].text;
						if (optVal.includes(courseName) || optText.includes(courseName)) {
							matchedIndex = i;
							break;
						}
					}

					// 2. Если не найдено, ищем по ключевым словам в кавычках (например, «Учусь, играя»)
					if (matchedIndex === -1) {
						const quoteMatch = courseName.match(/«([^»]+)»/);
						const keyword = quoteMatch ? quoteMatch[1] : courseName;
						for (let i = 0; i < courseSelect.options.length; i++) {
							const optVal = courseSelect.options[i].value;
							const optText = courseSelect.options[i].text;
							if (optVal.includes(keyword) || optText.includes(keyword)) {
								matchedIndex = i;
								break;
							}
						}
					}

					if (matchedIndex !== -1) {
						courseSelect.selectedIndex = matchedIndex;
						clearFieldError(courseSelect);
					}
				}

				if (enrollSection) {
					e.preventDefault();
					enrollSection.scrollIntoView({ behavior: "smooth", block: "start" });
					setTimeout(() => {
						if (parentNameInput) parentNameInput.focus();
					}, 450);
				}
			});
		});
	}

	/* --------------------------------------------------------------------------
	   3. ВАЛИДАЦИЯ И ОТПРАВКА ФОРМЫ ЗАПИСИ
	   -------------------------------------------------------------------------- */
	function initEnrollForm() {
		const form = document.getElementById("rst-enroll-form");
		if (!form) return;

		const parentName = document.getElementById("enroll-parent-name");
		const childName = document.getElementById("enroll-child-name");
		const childAge = document.getElementById("enroll-child-age");
		const course = document.getElementById("enroll-course");
		const contact = document.getElementById("enroll-contact");
		const comment = document.getElementById("enroll-comment");
		const consent = document.getElementById("enroll-consent");
		const hp = document.getElementById("enroll-hp");
		const submitBtn = document.getElementById("enroll-submit-btn");
		const statusBox = document.getElementById("enroll-status-box");

		const inputs = [parentName, childName, childAge, course, contact];

		// Снятие ошибок при вводе
		inputs.forEach(input => {
			if (!input) return;
			input.addEventListener("input", () => clearFieldError(input));
			input.addEventListener("change", () => clearFieldError(input));
		});

		if (consent) {
			consent.addEventListener("change", () => clearConsentError());
		}

		function clearAllErrors() {
			inputs.forEach(clearFieldError);
			clearConsentError();
			hideStatus();
		}

		function showStatus(type, message) {
			if (!statusBox) return;
			statusBox.className = `rst-status-box rst-status-box--${type}`;
			statusBox.innerHTML = message;
			statusBox.style.display = "block";
			try {
				statusBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
			} catch (e) { }
		}

		function hideStatus() {
			if (!statusBox) return;
			statusBox.style.display = "none";
			statusBox.textContent = "";
		}

		form.addEventListener("submit", async (e) => {
			e.preventDefault();
			clearAllErrors();

			let isValid = true;
			let firstInvalid = null;

			// 1. Имя родителя
			const parentVal = parentName ? parentName.value.trim() : "";
			if (!parentVal) {
				showFieldError(parentName, "Пожалуйста, укажите имя родителя или законного представителя");
				isValid = false;
				if (!firstInvalid) firstInvalid = parentName;
			} else if (parentVal.length < 2) {
				showFieldError(parentName, "Имя должно содержать не менее 2 символов");
				isValid = false;
				if (!firstInvalid) firstInvalid = parentName;
			}

			// 2. Имя ребёнка
			const childVal = childName ? childName.value.trim() : "";
			if (!childVal) {
				showFieldError(childName, "Пожалуйста, укажите имя ребёнка");
				isValid = false;
				if (!firstInvalid) firstInvalid = childName;
			} else if (childVal.length < 2) {
				showFieldError(childName, "Имя ребёнка должно содержать не менее 2 символов");
				isValid = false;
				if (!firstInvalid) firstInvalid = childName;
			}

			// 3. Возраст ребёнка
			const ageVal = childAge ? childAge.value.trim() : "";
			if (!ageVal) {
				showFieldError(childAge, "Пожалуйста, выберите возраст ребёнка");
				isValid = false;
				if (!firstInvalid) firstInvalid = childAge;
			}

			// 4. Направление занятий
			const courseVal = course ? course.value.trim() : "";
			if (!courseVal) {
				showFieldError(course, "Пожалуйста, выберите интересующую программу");
				isValid = false;
				if (!firstInvalid) firstInvalid = course;
			}

			// 5. Контакт (телефон или email)
			const contactVal = contact ? contact.value.trim() : "";
			if (!contactVal) {
				showFieldError(contact, "Пожалуйста, укажите номер телефона или email для связи");
				isValid = false;
				if (!firstInvalid) firstInvalid = contact;
			} else if (contactVal.includes("@")) {
				if (!EMAIL_REGEX.test(contactVal)) {
					showFieldError(contact, "Введите корректный email (например: ivanov@mail.ru)");
					isValid = false;
					if (!firstInvalid) firstInvalid = contact;
				}
			} else {
				const digits = contactVal.replace(/\D/g, "");
				if (digits.length < 10 || digits.length > 15 || !PHONE_CHARS_REGEX.test(contactVal)) {
					showFieldError(contact, "Введите корректный номер телефона (не менее 10 цифр, например: +7 (904) 957-75-51)");
					isValid = false;
					if (!firstInvalid) firstInvalid = contact;
				}
			}

			// 6. Согласие 152-ФЗ
			if (consent && !consent.checked) {
				showConsentError("Необходимо дать согласие на обработку персональных данных (152-ФЗ)");
				isValid = false;
				if (!firstInvalid) firstInvalid = consent;
			}

			if (!isValid) {
				showStatus("error", "Пожалуйста, проверьте правильность заполнения обязательных полей.");
				if (firstInvalid && typeof firstInvalid.focus === "function") {
					firstInvalid.focus();
				}
				return;
			}

			// Спам-ловушка Honeypot
			const hpVal = hp ? hp.value.trim() : "";

			// Блокировка кнопки и показ спиннера
			const originalBtnHtml = submitBtn.innerHTML;
			submitBtn.disabled = true;
			submitBtn.innerHTML = `<span class="rst-btn-spinner" aria-hidden="true"></span> Отправка заявки...`;

			const payload = {
				parent_name: parentVal,
				child_name: childVal,
				child_age: ageVal,
				course: courseVal,
				contact: contactVal,
				comment: comment ? comment.value.trim() : null,
				consent: true,
				hp: hpVal || null
			};

			try {
				let res = await fetch(ENROLL_ENDPOINT, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/json"
					},
					body: JSON.stringify(payload)
				});

				// Если специализированный роут вернул 404, отправляем через общий /api/feedback/
				if (res.status === 404) {
					const fallbackPayload = {
						name: `${parentVal} (ребёнок: ${childVal}, ${ageVal})`,
						contact: contactVal,
						subject: `Запись в «Росточек»: ${courseVal}`,
						message: `Программа: ${courseVal}\nИмя родителя: ${parentVal}\nИмя ребёнка: ${childVal}\nВозраст: ${ageVal}\nКомментарий: ${comment ? comment.value.trim() : "—"}`,
						source_page: "Центр «Росточек»",
						consent: true,
						hp: hpVal || null
					};

					res = await fetch(FALLBACK_ENDPOINT, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Accept": "application/json"
						},
						body: JSON.stringify(fallbackPayload)
					});
				}

				const result = await res.json().catch(() => ({}));

				if (res.ok && result.ok) {
					// УСПЕХ: очищаем поля
					form.reset();
					clearAllErrors();

					showStatus(
						"success",
						"<strong>Заявка успешно отправлена!</strong><br>Спасибо за проявленный интерес. Руководитель центра Оксана Александровна Борисенко свяжется с вами в ближайшее время для подтверждения записи и ответа на вопросы."
					);
				} else {
					let errorMsg = "Не удалось отправить заявку. Пожалуйста, попробуйте позже или свяжитесь с руководителем по телефону.";
					if (result.detail) {
						if (typeof result.detail === "string") {
							errorMsg = result.detail;
						} else if (Array.isArray(result.detail) && result.detail[0] && result.detail[0].msg) {
							errorMsg = result.detail[0].msg;
						}
					}
					showStatus("error", errorMsg);
				}
			} catch (err) {
				console.error("Ошибка при отправке заявки в Росточек:", err);
				showStatus("error", "Произошла сетевая ошибка при отправке заявки. Проверьте интернет-соединение или позвоните по телефону: 8-904-957-75-51.");
			} finally {
				submitBtn.disabled = false;
				submitBtn.innerHTML = originalBtnHtml;
			}
		});
	}

	/* --------------------------------------------------------------------------
	   4. ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ ПРИ СКРОЛЛЕ (INTERSECTION OBSERVER)
	   -------------------------------------------------------------------------- */
	function initScrollReveal() {
		const revealElements = document.querySelectorAll(
			".rst-program-card, .rst-adv-card, .rst-step-card, .rst-pillar-card, .rst-director-card, .rst-form-wrapper"
		);

		if (!("IntersectionObserver" in window)) {
			revealElements.forEach(el => el.classList.add("rst-reveal--visible"));
			return;
		}

		const observer = new IntersectionObserver((entries, obs) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add("rst-reveal--visible");
					obs.unobserve(entry.target);
				}
			});
		}, {
			threshold: 0.12,
			rootMargin: "0px 0px -40px 0px"
		});

		revealElements.forEach(el => {
			el.classList.add("rst-reveal");
			observer.observe(el);
		});
	}

	/* --------------------------------------------------------------------------
	   5. ПЛАВНЫЙ СКРОЛЛ К ЯКОРЯМ
	   -------------------------------------------------------------------------- */
	function initSmoothAnchors() {
		document.querySelectorAll('a[href^="#"]').forEach(anchor => {
			anchor.addEventListener("click", function (e) {
				const targetId = this.getAttribute("href");
				if (targetId === "#" || targetId.length <= 1) return;
				const target = document.querySelector(targetId);
				if (target) {
					e.preventDefault();
					target.scrollIntoView({ behavior: "smooth", block: "start" });
				}
			});
		});
	}
})();
