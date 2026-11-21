/**
 * footer-contacts.js
 * Интерактивный переключатель корпусов гимназии в блоке контактов футера
 * (Спасский корпус / Покровский корпус)
 */
(function () {
	'use strict';

	var CAMPUSES = {
		spassky: {
			id: 'spassky',
			name: 'Спасский корпус',
			address: 'г. Ковров, ул. Подлесная, д. 10',
			addressNote: 'Спасский корпус (приёмная, 1–4 классы)',
			badgeText: 'г. Ковров, ул. Подлесная, 10 (Спасский корпус)',
			mapSrc: 'https://yandex.ru/map-widget/v1/?ll=41.329367%2C56.362333&z=18&mode=whatshere&whatshere%5Bpoint%5D=41.329367%2C56.362333&whatshere%5Bzoom%5D=18',
			routeHref: 'https://yandex.ru/maps/?rtext=~56.362333%2C41.329367&rtt=auto'
		},
		pokrovsky: {
			id: 'pokrovsky',
			name: 'Покровский корпус',
			address: 'г. Ковров, ул. Сосновая, д. 10',
			addressNote: 'Покровский корпус (учительская, 5–11 классы)',
			badgeText: 'г. Ковров, ул. Сосновая, 10 (Покровский корпус)',
			mapSrc: 'https://yandex.ru/map-widget/v1/?ll=41.328297%2C56.363115&z=18&mode=whatshere&whatshere%5Bpoint%5D=41.328297%2C56.363115&whatshere%5Bzoom%5D=18',
			routeHref: 'https://yandex.ru/maps/?rtext=~56.363115%2C41.328297&rtt=auto'
		}
	};

	function initFooterContacts() {
		var tabsContainer = document.querySelector('.contact-map__tabs');
		if (!tabsContainer) return;

		var tabButtons = tabsContainer.querySelectorAll('.campus-tab-btn');
		var mapIframe = document.getElementById('footer-map-iframe');
		var badgeTextEl = document.getElementById('footer-map-badge-text');
		var routeBtn = document.getElementById('footer-map-route-btn');
		var addressValEl = document.getElementById('footer-contact-address');
		var addressNoteEl = document.getElementById('footer-contact-note');

		tabButtons.forEach(function (button) {
			button.addEventListener('click', function (e) {
				var currentBtn = e.currentTarget || button;
				var campusKey = currentBtn.getAttribute('data-campus');
				var data = CAMPUSES[campusKey];
				if (!data) return;

				tabButtons.forEach(function (btn) {
					btn.classList.remove('active');
					btn.setAttribute('aria-selected', 'false');
				});
				currentBtn.classList.add('active');
				currentBtn.setAttribute('aria-selected', 'true');

				if (mapIframe && mapIframe.src !== data.mapSrc) {
					mapIframe.style.opacity = '0.4';
					mapIframe.src = data.mapSrc;
					mapIframe.onload = function () {
						mapIframe.style.opacity = '1';
					};
				}

				if (badgeTextEl) {
					badgeTextEl.textContent = data.badgeText;
				}

				if (routeBtn) {
					routeBtn.href = data.routeHref;
				}

				if (addressValEl) {
					addressValEl.textContent = data.address;
				}

				if (addressNoteEl) {
					addressNoteEl.textContent = data.addressNote;
				}
			});
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initFooterContacts);
	} else {
		initFooterContacts();
	}
})();
