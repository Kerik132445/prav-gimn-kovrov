/**
 * feedback.js — Полноценная клиентская система отправки формы обратной связи
 * с динамическими темами для каждой страницы сайта.
 * ЧОУ «Православная гимназия г. Коврова»
 */
(() => {
	const API_URL = `${window.API_BASE_URL || ""}/api/feedback/`;

	// Регулярные выражения для валидации контактов
	const EMAIL_REGEX = /^[\w\.-]+@([\w-]+\.)+[\w-]{2,}$/;
	const PHONE_CHARS_REGEX = /^(\+?[0-9\s\-\(\)]{10,25})$/;

	/**
	 * ЦЕНТРАЛИЗОВАННАЯ КОНФИГУРАЦИЯ ТЕМ ОБРАЩЕНИЙ ДЛЯ СТРАНИЦ САЙТА
	 * Каждая страница имеет обоснованный список тем, составленный на основе её содержания и FAQ.
	 */
	const FEEDBACK_PAGE_TOPICS = {
		// 1. Поступающим (apply.html)
		"apply": {
			id: "apply",
			title: "Поступающим",
			topics: [
				"Запись на собеседование с директором",
				"Перевод ребенка из другой школы (2–11 классы)",
				"Подготовительные занятия в центре «Росточек»",
				"Вопрос по перечню документов и медкарте",
				"Условия зачисления и наличие свободных мест"
			]
		},

		// 2. Школьное питание (food.html)
		"food": {
			id: "food",
			title: "Школьное питание",
			topics: [
				"Оформление диетического/аллергического питания",
				"Питание в группе продлённого дня (ГПД)",
				"Оплата питания и стоимость обедов (5–11 классы)",
				"Участие в комиссии родительского контроля",
				"Отзыв или предложение по меню столовой"
			]
		},

		// 3. Расписание уроков и звонков (class_schedule.html)
		"schedule": {
			id: "schedule",
			title: "Расписание уроков",
			topics: [
				"Вопрос по текущим изменениям в расписании",
				"Расписание кружков и внеурочной деятельности",
				"Индивидуальный график (совмещение с доп. образованием)",
				"Освобождение от занятий по семейным обстоятельствам",
				"Вопрос по расписанию звонков и перемен"
			]
		},

		// 4. Наши преподаватели (teachers.html)
		"teachers": {
			id: "teachers",
			title: "Наши преподаватели",
			topics: [
				"Запись на индивидуальную консультацию с учителем",
				"Связь с классным руководителем",
				"Консультация педагога-психолога / логопеда",
				"Вопрос завучу по учебно-воспитательной работе",
				"Отзыв или благодарность педагогу"
			]
		},

		// 5. Документы и локальные акты (documents.html)
		"documents": {
			id: "documents",
			title: "Документы",
			topics: [
				"Заказ справки об обучении (для пособий, налоговой, военкомата)",
				"Получение заверенной копии документа с печатью",
				"Вопрос по локальным актам и уставу гимназии",
				"Запрос договора об образовании или бланка заявления",
				"Архивные справки и восстановление документов"
			]
		},

		// 6. Электронный дневник (diary.html / dairy.html)
		"diary": {
			id: "diary",
			title: "Электронный дневник",
			topics: [
				"Ошибка авторизации через Госуслуги",
				"Ребенок не отображается в личном кабинете родителя",
				"Не отображаются оценки или домашние задания",
				"Обновление СНИЛС / персональных данных в системе",
				"Техническая помощь по работе с электронным дневником"
			]
		},

		// 7. Контакты (contact.html)
		"contact": {
			id: "contact",
			title: "Контакты",
			topics: [
				"Запись на личный приём к директору",
				"Вопрос в бухгалтерию гимназии",
				"Обращение в канцелярию / секретариат",
				"Сотрудничество и благотворительность",
				"Общий вопрос руководству гимназии"
			]
		},

		// 8. Жизнь гимназии (life.html)
		"life": {
			id: "life",
			title: "Жизнь гимназии",
			topics: [
				"Участие в школьных мероприятиях и праздниках",
				"Паломнические поездки и экскурсии",
				"Творческие кружки, хор и мастерские",
				"Волонтерские и благотворительные проекты гимназии",
				"Предложение по организации мероприятий"
			]
		},

		// 9. Главная страница (index.html)
		"main": {
			id: "main",
			title: "Главная страница",
			topics: [
				"Поступление и приём документов",
				"Вопрос по образовательному процессу",
				"Группа продлённого дня (ГПД) и кружки",
				"Духовная жизнь и гимназические традиции",
				"Сотрудничество и поддержка гимназии"
			]
		},

		// 10. Центр раннего развития «Росточек» (rostochek.html)
		"rostochek": {
			id: "rostochek",
			title: "Центр «Росточек»",
			topics: [
				"Подготовка к школе «Учусь, играя» (от 5 лет)",
				"Подготовка к школе «Год до школы» (от 6 лет)",
				"«Английский для дошколят» (от 6 лет)",
				"«Английский для школьников» (от 7 лет)",
				"«Школа мяча» (5–6 лет)",
				"Творческая мастерская «Золотые ручки» (5–6 лет)",
				"«Умные математики» (1 класс)",
				"Консультация руководителя центра"
			]
		}
	};

	// Публичный доступ к справочнику тем для модулей
	window.FEEDBACK_PAGE_TOPICS = FEEDBACK_PAGE_TOPICS;

	/**
	 * Определяет ключ текущей страницы по data-атрибуту или URL.
	 */
	function resolvePageKey(form) {
		// 1. data-page на форме (наивысший приоритет)
		if (form && form.dataset && form.dataset.page) {
			const k = form.dataset.page.toLowerCase().trim();
			if (FEEDBACK_PAGE_TOPICS[k]) return k;
		}

		// 2. data-page на <body> или <main>
		if (document.body && document.body.dataset && document.body.dataset.page) {
			const k = document.body.dataset.page.toLowerCase().trim();
			if (FEEDBACK_PAGE_TOPICS[k]) return k;
		}
		const mainEl = document.querySelector("main");
		if (mainEl && mainEl.dataset && mainEl.dataset.page) {
			const k = mainEl.dataset.page.toLowerCase().trim();
			if (FEEDBACK_PAGE_TOPICS[k]) return k;
		}

		// 3. Fallback: по имени текущего файла в pathname
		const path = (window.location.pathname || "").toLowerCase();
		if (path.includes("rostochek")) return "rostochek";
		if (path.includes("apply")) return "apply";
		if (path.includes("food")) return "food";
		if (path.includes("schedule")) return "schedule";
		if (path.includes("teacher")) return "teachers";
		if (path.includes("document")) return "documents";
		if (path.includes("diary") || path.includes("dairy")) return "diary";
		if (path.includes("contact")) return "contact";
		if (path.includes("life")) return "life";
		if (path.includes("index") || path.endsWith("/") || path === "") return "main";

		return "main";
	}

	function initFeedbackForms() {
		const forms = document.querySelectorAll(".feedback__form");
		if (!forms || forms.length === 0) return;

		forms.forEach(form => setupForm(form));
	}

	function setupForm(form) {
		// Предотвращение двойной инициализации
		if (form.dataset.feedbackInitialized) return;
		form.dataset.feedbackInitialized = "true";

		const pageKey = resolvePageKey(form);
		const pageConfig = FEEDBACK_PAGE_TOPICS[pageKey] || FEEDBACK_PAGE_TOPICS["main"];

		// Гарантируем скрытое поле с названием страницы для 100% надежной отправки
		let hiddenPageInput = form.querySelector('input[name="source_page"]');
		if (!hiddenPageInput) {
			hiddenPageInput = document.createElement("input");
			hiddenPageInput.type = "hidden";
			hiddenPageInput.name = "source_page";
			hiddenPageInput.value = pageConfig.title;
			form.appendChild(hiddenPageInput);
		} else if (!hiddenPageInput.value) {
			hiddenPageInput.value = pageConfig.title;
		}

		const nameInput = form.querySelector("#user-name") || form.querySelector('input[name="name"]');
		const contactInput = form.querySelector("#user-contact") || form.querySelector('input[name="contact"]');
		const msgInput = form.querySelector("#user-msg") || form.querySelector("textarea");
		const consentCheckbox = form.querySelector('input[type="checkbox"]');
		const submitBtn = form.querySelector('button[type="submit"]');

		// Обработка / генерация выпадающего списка тем
		let themeSelect = form.querySelector("#user-theme");

		// Если элемент был input[type="text"], заменяем его на чистый <select>
		if (themeSelect && themeSelect.tagName.toLowerCase() !== "select") {
			const selectEl = document.createElement("select");
			selectEl.id = "user-theme";
			selectEl.name = "theme";
			selectEl.className = "form-select";
			themeSelect.parentNode.replaceChild(selectEl, themeSelect);
			themeSelect = selectEl;

			// Удаляем datalist, если он остался от прежней версии
			const dl = form.querySelector("#theme-suggestions");
			if (dl && dl.parentNode) dl.parentNode.removeChild(dl);
		}

		// Если select существует, наполняем его динамическими темами текущей страницы
		if (themeSelect) {
			populateThemeSelect(themeSelect, pageConfig);
		}

		// Обновляем подпись к теме, если она есть
		const themeLabel = form.querySelector('label[for="user-theme"]');
		if (themeLabel) {
			themeLabel.innerHTML = `Тема обращения <span class="label-optional">(необязательно)</span>`;
		}

		// Ловушка honeypot для спам-ботов
		let hpInput = form.querySelector('input[name="feedback_hp"]');
		if (!hpInput) {
			const hpWrapper = document.createElement("div");
			hpWrapper.style.cssText = "display:none!important; position:absolute; left:-9999px;";
			hpWrapper.setAttribute("aria-hidden", "true");
			hpInput = document.createElement("input");
			hpInput.type = "text";
			hpInput.name = "feedback_hp";
			hpInput.id = "feedback-hp-" + Math.random().toString(36).substring(2, 7);
			hpInput.tabIndex = -1;
			hpInput.autocomplete = "off";
			hpWrapper.appendChild(hpInput);
			form.appendChild(hpWrapper);
		}

		// Встроенный контейнер статуса прямо под формой
		let statusContainer = form.querySelector(".feedback-status");
		if (!statusContainer) {
			statusContainer = document.createElement("div");
			statusContainer.className = "feedback-status";
			statusContainer.setAttribute("role", "alert");
			statusContainer.setAttribute("aria-live", "polite");
			statusContainer.style.display = "none";

			const footer = form.querySelector(".form-footer");
			if (footer && footer.parentNode) {
				footer.parentNode.insertBefore(statusContainer, footer.nextSibling);
			} else {
				form.appendChild(statusContainer);
			}
		}

		// Помощник для отображения ошибок под полями
		function getErrorSpan(input) {
			if (!input) return null;
			let span = input.parentNode ? input.parentNode.querySelector(".field-error-message") : null;
			if (!span && input.parentNode) {
				span = document.createElement("span");
				span.className = "field-error-message";
				span.style.display = "none";
				input.parentNode.appendChild(span);
			}
			return span;
		}

		function showFieldError(input, message) {
			if (!input) return;
			input.classList.add("form-input--error");
			const customTrigger = input.closest(".feedback-custom-select")?.querySelector(".feedback-custom-select__trigger");
			if (customTrigger) customTrigger.classList.add("form-input--error");
			const span = getErrorSpan(input);
			if (span) {
				span.textContent = message;
				span.style.display = "block";
			}
		}

		function clearFieldError(input) {
			if (!input) return;
			input.classList.remove("form-input--error");
			const customTrigger = input.closest(".feedback-custom-select")?.querySelector(".feedback-custom-select__trigger");
			if (customTrigger) customTrigger.classList.remove("form-input--error");
			const span = getErrorSpan(input);
			if (span) {
				span.textContent = "";
				span.style.display = "none";
			}
		}

		function clearAllErrors() {
			[nameInput, contactInput, themeSelect, msgInput].forEach(clearFieldError);
			if (consentCheckbox && consentCheckbox.parentNode) {
				const span = consentCheckbox.parentNode.parentNode.querySelector(".field-error-message--consent");
				if (span) span.style.display = "none";
			}
			hideStatus();
		}

		// Снятие ошибок при вводе
		[nameInput, contactInput, themeSelect, msgInput].forEach(inp => {
			if (!inp) return;
			inp.addEventListener("input", () => clearFieldError(inp));
			inp.addEventListener("change", () => clearFieldError(inp));
		});

		if (consentCheckbox) {
			consentCheckbox.addEventListener("change", () => {
				const span = form.querySelector(".field-error-message--consent");
				if (span) span.style.display = "none";
			});
		}

		form.addEventListener("reset", () => {
			setTimeout(() => {
				if (themeSelect) {
					themeSelect.value = "";
					themeSelect.dispatchEvent(new Event("change", { bubbles: true }));
				}
			}, 30);
		});

		function showStatus(type, message) {
			if (!statusContainer) return;
			statusContainer.className = `feedback-status feedback-status--${type}`;
			statusContainer.innerHTML = message;
			statusContainer.style.display = "block";
			try {
				statusContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
			} catch (e) { }
		}

		function hideStatus() {
			if (!statusContainer) return;
			statusContainer.style.display = "none";
			statusContainer.textContent = "";
		}

		// Обработчик отправки формы
		form.addEventListener("submit", async (e) => {
			e.preventDefault();
			clearAllErrors();

			let isValid = true;
			let firstInvalidInput = null;

			// 1. Валидация имени (обязательно)
			const nameVal = nameInput ? nameInput.value.trim() : "";
			if (!nameVal) {
				showFieldError(nameInput, "Пожалуйста, введите ваше имя");
				isValid = false;
				if (!firstInvalidInput) firstInvalidInput = nameInput;
			} else if (nameVal.length < 2) {
				showFieldError(nameInput, "Имя должно содержать не менее 2 символов");
				isValid = false;
				if (!firstInvalidInput) firstInvalidInput = nameInput;
			} else if (nameVal.length > 100) {
				showFieldError(nameInput, "Имя не должно превышать 100 символов");
				isValid = false;
				if (!firstInvalidInput) firstInvalidInput = nameInput;
			}

			// 2. Валидация контактов: телефон или email (обязательно)
			const contactVal = contactInput ? contactInput.value.trim() : "";
			if (!contactVal) {
				showFieldError(contactInput, "Пожалуйста, укажите номер телефона или email");
				isValid = false;
				if (!firstInvalidInput) firstInvalidInput = contactInput;
			} else if (contactVal.length > 100) {
				showFieldError(contactInput, "Контактные данные не должны превышать 100 символов");
				isValid = false;
				if (!firstInvalidInput) firstInvalidInput = contactInput;
			} else if (contactVal.includes("@")) {
				// Валидация Email
				if (!EMAIL_REGEX.test(contactVal)) {
					showFieldError(contactInput, "Некорректный формат email (пример: ivan@mail.ru)");
					isValid = false;
					if (!firstInvalidInput) firstInvalidInput = contactInput;
				}
			} else {
				// Валидация Телефона
				const digits = contactVal.replace(/\D/g, "");
				if (digits.length < 10 || digits.length > 15 || !PHONE_CHARS_REGEX.test(contactVal)) {
					showFieldError(contactInput, "Некорректный номер телефона (не менее 10 цифр, пример: +7 (999) 123-45-67)");
					isValid = false;
					if (!firstInvalidInput) firstInvalidInput = contactInput;
				}
			}

			// 3. Тема обращения: НЕОБЯЗАТЕЛЬНОЕ ПОЛЕ
			// Если пользователь не выбрал или выбрал пустой вариант — сохраняем null
			const themeVal = themeSelect && themeSelect.value ? themeSelect.value.trim() : null;

			// 4. Валидация сообщения (обязательно)
			const msgVal = msgInput ? msgInput.value.trim() : "";
			if (!msgVal) {
				showFieldError(msgInput, "Пожалуйста, введите текст сообщения");
				isValid = false;
				if (!firstInvalidInput) firstInvalidInput = msgInput;
			} else if (msgVal.length < 5) {
				showFieldError(msgInput, "Сообщение слишком короткое (не менее 5 символов)");
				isValid = false;
				if (!firstInvalidInput) firstInvalidInput = msgInput;
			} else if (msgVal.length > 3000) {
				showFieldError(msgInput, "Сообщение не должно превышать 3000 символов");
				isValid = false;
				if (!firstInvalidInput) firstInvalidInput = msgInput;
			}

			// 5. Валидация согласия 152-ФЗ (обязательно)
			if (consentCheckbox && !consentCheckbox.checked) {
				let consentError = form.querySelector(".field-error-message--consent");
				if (!consentError && consentCheckbox.parentNode) {
					consentError = document.createElement("span");
					consentError.className = "field-error-message field-error-message--consent";
					consentCheckbox.parentNode.parentNode.appendChild(consentError);
				}
				if (consentError) {
					consentError.textContent = "Необходимо дать согласие на обработку персональных данных (152-ФЗ)";
					consentError.style.display = "block";
				}
				isValid = false;
				if (!firstInvalidInput) firstInvalidInput = consentCheckbox;
			}

			// Если есть ошибки валидации — останавливаем отправку
			if (!isValid) {
				showStatus("error", "Пожалуйста, заполните все обязательные поля корректно.");
				if (firstInvalidInput && typeof firstInvalidInput.focus === "function") {
					firstInvalidInput.focus();
				}
				return;
			}

			// Honeypot ловушка
			const hpVal = hpInput ? hpInput.value.trim() : "";

			// Блокируем кнопку на время отправки
			const originalBtnHtml = submitBtn ? submitBtn.innerHTML : "Отправить обращение";
			if (submitBtn) {
				submitBtn.disabled = true;
				submitBtn.classList.add("btn--loading");
				submitBtn.innerHTML = `<span class="btn-spinner" aria-hidden="true"></span> Отправка...`;
			}

			try {
				const hiddenSourceInput = form.querySelector('input[name="source_page"]');
				const detectedPageName = (hiddenSourceInput && hiddenSourceInput.value.trim())
					|| (form.dataset && (form.dataset.pageName || form.dataset.pageTitle))
					|| (pageConfig && pageConfig.title)
					|| (FEEDBACK_PAGE_TOPICS[resolvePageKey(form)] && FEEDBACK_PAGE_TOPICS[resolvePageKey(form)].title)
					|| "Главная страница";

				const payload = {
					name: nameVal,
					contact: contactVal,
					subject: themeVal || null,
					source_page: detectedPageName,
					message: msgVal,
					consent: true,
					hp: hpVal || null
				};

				const response = await fetch(API_URL, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Accept": "application/json"
					},
					body: JSON.stringify(payload)
				});

				const result = await response.json().catch(() => ({}));

				if (response.ok && result.ok) {
					// УСПЕХ:
					// Очищаем форму
					if (nameInput) nameInput.value = "";
					if (contactInput) contactInput.value = "";
					if (themeSelect) {
						themeSelect.value = "";
						themeSelect.classList.add("select--unselected");
						themeSelect.dispatchEvent(new Event("change", { bubbles: true }));
					}
					if (msgInput) msgInput.value = "";
					if (consentCheckbox) consentCheckbox.checked = false;
					if (hpInput) hpInput.value = "";

					// Спокойное зеленое уведомление под формой
					showStatus(
						"success",
						"Ваше обращение успешно отправлено! Спасибо за обратную связь. Администрация гимназии рассмотрит ваше сообщение."
					);
				} else {
					// Сервер вернул ошибку
					let errorMsg = "Произошла ошибка при отправке обращения. Пожалуйста, попробуйте позже.";
					if (result.detail) {
						if (typeof result.detail === "string") {
							errorMsg = result.detail;
						} else if (Array.isArray(result.detail) && result.detail[0]?.msg) {
							errorMsg = result.detail[0].msg.replace("Value error, ", "");
						}
					}
					// НЕ очищаем поля формы, чтобы пользователь не потерял набранный текст!
					showStatus("error", errorMsg);
				}
			} catch (networkErr) {
				console.error("Feedback network error:", networkErr);
				// НЕ очищаем поля формы при сетевом сбое
				showStatus(
					"error",
					"Не удалось связаться с сервером. Пожалуйста, проверьте подключение к интернету или повторите попытку позже."
				);
			} finally {
				// Разблокируем кнопку отправки
				if (submitBtn) {
					submitBtn.disabled = false;
					submitBtn.classList.remove("btn--loading");
					submitBtn.innerHTML = originalBtnHtml;
				}
			}
		});
	}

	/**
	 * Наполняет выпадающий список нейтральным пунктом и темами текущей страницы.
	 */
	function populateThemeSelect(selectEl, pageConfig) {
		if (!selectEl) return;

		selectEl.innerHTML = "";

		// Нейтральный первый пункт (не выбирать тему)
		const neutralOpt = document.createElement("option");
		neutralOpt.value = "";
		neutralOpt.textContent = "Не выбрана — задам свой вопрос";
		selectEl.appendChild(neutralOpt);

		// Темы текущей страницы
		const topics = (pageConfig && pageConfig.topics) || [];
		topics.forEach(topic => {
			const opt = document.createElement("option");
			opt.value = topic;
			opt.textContent = topic;
			selectEl.appendChild(opt);
		});

		// Функция управления приглушенным цветом для невыбранного состояния
		function updateSelectStyle() {
			if (!selectEl.value) {
				selectEl.classList.add("select--unselected");
			} else {
				selectEl.classList.remove("select--unselected");
			}
		}

		updateSelectStyle();
		selectEl.addEventListener("change", updateSelectStyle);

		// Создаем или обновляем кастомный выпадающий список в синем стиле гимназии
		setupCustomThemeSelect(selectEl);
	}

	/**
	 * Оборачивает нативный select темы в элегантный кастомный выпадающий список
	 * в едином синем стиле сайта гимназии.
	 */
	function setupCustomThemeSelect(selectEl) {
		if (!selectEl) return;

		let wrapper = selectEl.closest(".feedback-custom-select");
		if (!wrapper) {
			wrapper = document.createElement("div");
			wrapper.className = "feedback-custom-select";
			selectEl.parentNode.insertBefore(wrapper, selectEl);
			wrapper.appendChild(selectEl);
		}

		selectEl.classList.add("feedback-select-native-hidden");
		selectEl.tabIndex = -1;
		selectEl.setAttribute("aria-hidden", "true");

		let trigger = wrapper.querySelector(".feedback-custom-select__trigger");
		let dropdown = wrapper.querySelector(".feedback-custom-select__dropdown");
		if (!trigger) {
			trigger = document.createElement("button");
			trigger.type = "button";
			trigger.className = "feedback-custom-select__trigger";
			trigger.setAttribute("aria-haspopup", "listbox");
			trigger.setAttribute("aria-expanded", "false");
			wrapper.insertBefore(trigger, selectEl);
		}
		if (!dropdown) {
			dropdown = document.createElement("div");
			dropdown.className = "feedback-custom-select__dropdown";
			dropdown.setAttribute("role", "listbox");
			dropdown.tabIndex = -1;
			wrapper.appendChild(dropdown);
		}

		function updateTriggerText() {
			const selectedOpt = selectEl.options[selectEl.selectedIndex] || selectEl.options[0];
			const text = selectedOpt ? selectedOpt.textContent : "Не выбрана — задам свой вопрос";
			const valEl = trigger.querySelector(".feedback-custom-select__val");
			if (valEl) {
				valEl.textContent = text;
			}
			if (selectEl.value) {
				trigger.classList.add("has-value");
			} else {
				trigger.classList.remove("has-value");
			}
		}

		trigger.innerHTML = `
			<span class="feedback-custom-select__val">Не выбрана — задам свой вопрос</span>
			<span class="feedback-custom-select__arrow" aria-hidden="true">
				<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
			</span>
		`;

		dropdown.innerHTML = "";
		Array.from(selectEl.options).forEach(opt => {
			const item = document.createElement("div");
			item.className = "feedback-custom-select__option";
			item.setAttribute("role", "option");
			item.dataset.value = opt.value;
			const isSelected = opt.value === selectEl.value;
			item.setAttribute("aria-selected", isSelected ? "true" : "false");
			if (isSelected) {
				item.classList.add("feedback-custom-select__option--selected");
			}
			item.innerHTML = `
				<span>${opt.textContent}</span>
				<span class="feedback-custom-select__check" aria-hidden="true">
					<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M16.6 5L7.5 14.1L3.3 10" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
				</span>
			`;

			item.addEventListener("click", (e) => {
				e.stopPropagation();
				selectEl.value = opt.value;
				selectEl.dispatchEvent(new Event("change", { bubbles: true }));
				selectEl.dispatchEvent(new Event("input", { bubbles: true }));
				closeDropdown();
				trigger.focus();
			});

			dropdown.appendChild(item);
		});

		updateTriggerText();

		function closeDropdown() {
			wrapper.classList.remove("feedback-custom-select--open");
			trigger.setAttribute("aria-expanded", "false");
		}

		function openDropdown() {
			document.querySelectorAll(".feedback-custom-select--open, .rst-custom-select--open").forEach(el => {
				if (el !== wrapper) {
					el.classList.remove("feedback-custom-select--open", "rst-custom-select--open");
					const b = el.querySelector(".feedback-custom-select__trigger, .rst-custom-select__trigger");
					if (b) b.setAttribute("aria-expanded", "false");
				}
			});
			wrapper.classList.add("feedback-custom-select--open");
			trigger.setAttribute("aria-expanded", "true");
			const sel = dropdown.querySelector(".feedback-custom-select__option--selected");
			if (sel) sel.scrollIntoView({ block: "nearest" });
		}

		trigger.onclick = (e) => {
			e.stopPropagation();
			if (wrapper.classList.contains("feedback-custom-select--open")) {
				closeDropdown();
			} else {
				openDropdown();
			}
		};

		// Клавиатурная навигация
		trigger.onkeydown = (e) => {
			const isOpen = wrapper.classList.contains("feedback-custom-select--open");
			const items = Array.from(dropdown.querySelectorAll(".feedback-custom-select__option"));
			if (e.key === "ArrowDown") {
				e.preventDefault();
				if (!isOpen) {
					openDropdown();
				} else {
					const curr = items.findIndex(i => i.classList.contains("feedback-custom-select__option--selected"));
					const next = (curr + 1) % items.length;
					items[next].click();
				}
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				if (isOpen) {
					const curr = items.findIndex(i => i.classList.contains("feedback-custom-select__option--selected"));
					const prev = curr <= 0 ? items.length - 1 : curr - 1;
					items[prev].click();
				}
			} else if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				trigger.click();
			} else if (e.key === "Escape") {
				if (isOpen) {
					e.preventDefault();
					closeDropdown();
				}
			}
		};

		selectEl.addEventListener("change", () => {
			updateTriggerText();
			dropdown.querySelectorAll(".feedback-custom-select__option").forEach(item => {
				if (item.dataset.value === selectEl.value) {
					item.classList.add("feedback-custom-select__option--selected");
					item.setAttribute("aria-selected", "true");
				} else {
					item.classList.remove("feedback-custom-select__option--selected");
					item.setAttribute("aria-selected", "false");
				}
			});
			trigger.classList.remove("form-input--error");
		});
	}

	// Глобальное закрытие кастомных селектов при клике снаружи
	document.addEventListener("click", () => {
		document.querySelectorAll(".feedback-custom-select--open").forEach(el => {
			el.classList.remove("feedback-custom-select--open");
			const b = el.querySelector(".feedback-custom-select__trigger");
			if (b) b.setAttribute("aria-expanded", "false");
		});
	});

	// Инициализация при готовности DOM
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initFeedbackForms);
	} else {
		initFeedbackForms();
	}
})();
