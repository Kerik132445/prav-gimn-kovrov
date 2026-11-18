/**
 * contact.js — Интерактивный функционал страницы контактов:
 * переключение корпусов гимназии (Спасский, Покровский, Спортзал),
 * обновление информации, фотографий и подсказок карты,
 * копирование адреса в буфер обмена.
 */

document.addEventListener('DOMContentLoaded', function () {
	var campusesData = {
		spassky: {
			tabId: 'tab-btn-spassky',
			title: 'Спасский корпус (Главное здание)',
			desc: 'Здесь занимаются 1–4 классы, расположены приёмная директора, Сретенский храм и общая канцелярия',
			badgeRole: 'НАЧАЛЬНАЯ ШКОЛА (1–4 КЛАССЫ)',
			statusText: 'Открыто • До 16:30',
			imgSrc: 'assets/images/spassky-real.webp',
			addr: '601909, г. Ковров, ул. Подлесная, д. 10',
			addrSub: 'Центральный вход на территорию, пост охраны №1 (рядом со Сретенским храмом)',
			copyText: 'ул. Подлесная, д. 10',
			hoursVal: 'Понедельник – Пятница: 08:00 – 16:30',
			hoursSub: 'Учебные занятия: 08:20 – 14:00 • ГПД до 16:30',
			phoneLabel: 'Приемная / Секретарь',
			phoneLink: '+7 (49232) 4-01-95',
			phoneHref: 'tel:+74923240195',
			phoneSub: 'Директор: прот. Михаил Бунтилов (тел. 8-920-622-56-76)',
			entryVal: 'Вход через центральные ворота с ул. Подлесной или с ул. Сосновой',
			entrySub: 'Посещение родителей по предварительной записи или звонку',
			mapTitle: 'Спасский корпус гимназии (1–4 классы)',
			mapSub: 'ул. Подлесная, 10 • Центральный вход со стороны Подлесной',
			mapSrc: 'https://yandex.ru/map-widget/v1/?ll=41.329367%2C56.362333&z=18&mode=whatshere&whatshere%5Bpoint%5D=41.329367%2C56.362333&whatshere%5Bzoom%5D=18',
			routeHref: 'https://yandex.ru/maps/?rtext=~56.362333%2C41.329367&rtt=auto'
		},
		pokrovsky: {
			tabId: 'tab-btn-pokrovsky',
			title: 'Покровский корпус (Средняя и старшая школа)',
			desc: 'Учебные кабинеты 5–11 классов, лаборатории, учительская и библиотека',
			badgeRole: 'ОСНОВНАЯ И СТАРШАЯ ШКОЛА (5–11 КЛАССЫ)',
			statusText: 'Открыто • До 16:00',
			imgSrc: 'assets/images/pokrovsky-real.webp',
			addr: '601909, г. Ковров, ул. Сосновая, д. 10 (в документах: ул. Подлесная, 10/1)',
			addrSub: 'Северный учебный корпус, проход со школьного двора или ул. Сосновой',
			copyText: 'ул. Сосновая, д. 10',
			hoursVal: 'Понедельник – Суббота: 08:00 – 16:00',
			hoursSub: 'Учебные занятия: 08:20 – 15:00 • Факультативы до 16:00',
			phoneLabel: 'Учительская / Завуч по УВР',
			phoneLink: '+7 (49232) 4-22-72',
			phoneHref: 'tel:+74923242272',
			phoneSub: 'Завуч: Пн–Пт 08:30 – 16:00',
			entryVal: 'Вход со стороны школьного двора / ул. Сосновой или через галерею со Спасского корпуса',
			entrySub: 'Электронная пропускная система турникетов (ближайшая ост. «Улица Калинина»)',
			mapTitle: 'Покровский корпус гимназии (5–11 классы)',
			mapSub: 'ул. Сосновая, 10 (ул. Подлесная, 10/1) • Ближе к ул. Калинина',
			mapSrc: 'https://yandex.ru/map-widget/v1/?ll=41.328297%2C56.363115&z=18&mode=whatshere&whatshere%5Bpoint%5D=41.328297%2C56.363115&whatshere%5Bzoom%5D=18',
			routeHref: 'https://yandex.ru/maps/?rtext=~56.363115%2C41.328297&rtt=auto'
		},
		sports: {
			tabId: 'tab-btn-sports',
			title: 'Спортивный комплекс и Архангельский корпус',
			desc: 'Спортивный зал, актовый зал, секция ВПК и творческие мастерские',
			badgeRole: 'СПОРТИВНО-ТВОРЧЕСКИЙ БЛОК',
			statusText: 'Занятия по расписанию секций',
			imgSrc: 'assets/images/sports-real.webp',
			addr: '601909, г. Ковров, ул. Сосновая, д. 10 (Архангельский корпус / Спортзал)',
			addrSub: 'Спортивный комплекс (в документах: ул. Подлесная, д. 10/2)',
			copyText: 'ул. Сосновая, д. 10',
			hoursVal: 'Понедельник – Суббота: 08:00 – 19:00',
			hoursSub: 'Уроки физкультуры + кружки и секции во 2-й половине дня',
			phoneLabel: 'Дежурный администратор',
			phoneLink: '+7 (49232) 4-01-95',
			phoneHref: 'tel:+74923240195',
			phoneSub: 'Связь с руководителями спортивных и творческих объединений',
			entryVal: 'Вход со школьного двора или через вестибюль гимназии',
			entrySub: 'Для родителей на соревнованиях и праздниках — вход свободный',
			mapTitle: 'Архангельский корпус и Спортзал гимназии',
			mapSub: 'Спорткомплекс • Вход со стороны двора и ул. Сосновой / Пионерской',
			mapSrc: 'https://yandex.ru/map-widget/v1/?ll=41.328907%2C56.362902&z=18&mode=whatshere&whatshere%5Bpoint%5D=41.328907%2C56.362902&whatshere%5Bzoom%5D=18',
			routeHref: 'https://yandex.ru/maps/?rtext=~56.362902%2C41.328907&rtt=auto'
		}
	};

	var currentCampus = 'spassky';

	function switchCampus(key) {
		var data = campusesData[key];
		if (!data) return;
		currentCampus = key;

		var tabButtons = document.querySelectorAll('.campus-tab-item');
		tabButtons.forEach(function (btn) {
			btn.classList.remove('active');
			btn.setAttribute('aria-selected', 'false');
		});

		var activeTab = document.getElementById(data.tabId);
		if (activeTab) {
			activeTab.classList.add('active');
			activeTab.setAttribute('aria-selected', 'true');
		}

		var heroImg = document.getElementById('campus-hero-img');
		if (heroImg) {
			heroImg.src = data.imgSrc;
			heroImg.alt = data.title;
		}

		var badgeRole = document.getElementById('campus-badge-role');
		if (badgeRole) badgeRole.textContent = data.badgeRole;

		var statusText = document.getElementById('campus-status-text');
		if (statusText) statusText.textContent = data.statusText;

		var heroTitle = document.getElementById('campus-hero-title');
		if (heroTitle) heroTitle.textContent = data.title;

		var heroDesc = document.getElementById('campus-hero-desc');
		if (heroDesc) heroDesc.textContent = data.desc;

		var addrVal = document.getElementById('campus-addr-val');
		if (addrVal) addrVal.textContent = data.addr;

		var addrSub = document.getElementById('campus-addr-sub');
		if (addrSub) addrSub.textContent = data.addrSub;

		var hoursVal = document.getElementById('campus-hours-val');
		if (hoursVal) hoursVal.textContent = data.hoursVal;

		var hoursSub = document.getElementById('campus-hours-sub');
		if (hoursSub) hoursSub.textContent = data.hoursSub;

		var phoneLabel = document.getElementById('campus-phone-label');
		if (phoneLabel) phoneLabel.textContent = data.phoneLabel;

		var phoneLink = document.getElementById('campus-phone-link');
		if (phoneLink) {
			phoneLink.textContent = data.phoneLink;
			phoneLink.href = data.phoneHref;
		}

		var phoneSub = document.getElementById('campus-phone-sub');
		if (phoneSub) phoneSub.textContent = data.phoneSub;

		var entryVal = document.getElementById('campus-entry-val');
		if (entryVal) entryVal.textContent = data.entryVal;

		var entrySub = document.getElementById('campus-entry-sub');
		if (entrySub) entrySub.textContent = data.entrySub;

		var callBtn = document.getElementById('btn-call-action');
		if (callBtn) callBtn.href = data.phoneHref;

		var mapTitle = document.getElementById('map-target-title');
		if (mapTitle) mapTitle.textContent = data.mapTitle;

		var mapSub = document.getElementById('map-target-address');
		if (mapSub) mapSub.textContent = data.mapSub;

		var mapRouteBtn = document.getElementById('map-route-btn');
		if (mapRouteBtn && data.routeHref) {
			mapRouteBtn.href = data.routeHref;
		}

		var btnRouteAction = document.getElementById('btn-route-action');
		if (btnRouteAction && data.routeHref) {
			btnRouteAction.href = data.routeHref;
		}

		var mapIframe = document.getElementById('contacts-map-iframe');
		if (mapIframe && data.mapSrc) {
			var currentSrc = mapIframe.getAttribute('src');
			if (currentSrc !== data.mapSrc) {
				mapIframe.style.opacity = '0.35';
				mapIframe.src = data.mapSrc;
				mapIframe.onload = function () {
					mapIframe.style.opacity = '1';
				};
			}
		}
	}

	// Подключение кликов по табам
	var tabSpassky = document.getElementById('tab-btn-spassky');
	if (tabSpassky) {
		tabSpassky.addEventListener('click', function () {
			switchCampus('spassky');
		});
	}

	var tabPokrovsky = document.getElementById('tab-btn-pokrovsky');
	if (tabPokrovsky) {
		tabPokrovsky.addEventListener('click', function () {
			switchCampus('pokrovsky');
		});
	}

	var tabSports = document.getElementById('tab-btn-sports');
	if (tabSports) {
		tabSports.addEventListener('click', function () {
			switchCampus('sports');
		});
	}

	// Копирование адреса с уведомлением
	var copyBtn = document.getElementById('campus-copy-address-btn');
	var toast = document.getElementById('contact-toast');
	var toastTimer = null;

	function showToast(text) {
		if (!toast) return;
		toast.textContent = text;
		toast.classList.add('show');
		if (toastTimer) clearTimeout(toastTimer);
		toastTimer = setTimeout(function () {
			toast.classList.remove('show');
		}, 2500);
	}

	if (copyBtn) {
		copyBtn.addEventListener('click', function () {
			var currentData = campusesData[currentCampus];
			var textToCopy = currentData ? currentData.copyText : 'ул. Подлесная, д. 10';
			if (navigator.clipboard && navigator.clipboard.writeText) {
				navigator.clipboard.writeText(textToCopy).then(function () {
					showToast('Адрес скопирован: ' + textToCopy);
				}).catch(function () {
					fallbackCopy(textToCopy);
				});
			} else {
				fallbackCopy(textToCopy);
			}
		});
	}

	function fallbackCopy(text) {
		var textArea = document.createElement('textarea');
		textArea.value = text;
		textArea.style.position = 'fixed';
		textArea.style.left = '-9999px';
		document.body.appendChild(textArea);
		textArea.select();
		try {
			document.execCommand('copy');
			showToast('Адрес скопирован: ' + text);
		} catch (e) {
			showToast('Адрес: ' + text);
		}
		document.body.removeChild(textArea);
	}
});
