/**
 * bvi.js — Панель доступности для слабовидящих (ГОСТ Р 52872-2019)
 */
(function () {
	const STORAGE_KEY = 'gimn_bvi_settings';

	const defaultSettings = {
		active: false,
		fontSize: 'normal', // 'normal', 'md', 'lg'
		theme: 'white', // 'white', 'black', 'blue'
		hideImages: false
	};

	let settings = Object.assign({}, defaultSettings);

	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) settings = Object.assign({}, defaultSettings, JSON.parse(saved));
	} catch (e) {
		console.warn('BVI localStorage error:', e);
	}

	function saveSettings() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
		} catch (e) { }
	}

	function applySettings() {
		const body = document.body;
		if (!body) return;

		// Font
		body.classList.remove('bvi-font-md', 'bvi-font-lg');
		if (settings.active && settings.fontSize === 'md') body.classList.add('bvi-font-md');
		if (settings.active && settings.fontSize === 'lg') body.classList.add('bvi-font-lg');

		// Theme
		body.classList.remove('bvi-theme-white', 'bvi-theme-black', 'bvi-theme-blue');
		if (settings.active && settings.theme === 'black') body.classList.add('bvi-theme-black');
		if (settings.active && settings.theme === 'blue') body.classList.add('bvi-theme-blue');
		if (settings.active && settings.theme === 'white') body.classList.add('bvi-theme-white');

		// Images
		if (settings.active && settings.hideImages) {
			body.classList.add('bvi-hide-images');
		} else {
			body.classList.remove('bvi-hide-images');
		}

		// Panel visibility
		const panel = document.getElementById('bvi-panel');
		if (panel) {
			panel.classList.toggle('is-active', settings.active);
		}
	}

	function createPanel() {
		if (document.getElementById('bvi-panel')) return;

		const panel = document.createElement('div');
		panel.id = 'bvi-panel';
		panel.className = 'bvi-panel' + (settings.active ? ' is-active' : '');
		panel.setAttribute('role', 'region');
		panel.setAttribute('aria-label', 'Панель настроек доступности для слабовидящих');

		panel.innerHTML = `
			<div class="bvi-panel__container">
				<div class="bvi-panel__group">
					<span class="bvi-panel__label">Размер шрифта:</span>
					<button type="button" class="bvi-btn" data-bvi-font="normal">A (Обычный)</button>
					<button type="button" class="bvi-btn" data-bvi-font="md">A+ (Средний)</button>
					<button type="button" class="bvi-btn" data-bvi-font="lg">A++ (Большой)</button>
				</div>
				<div class="bvi-panel__group">
					<span class="bvi-panel__label">Цвета:</span>
					<button type="button" class="bvi-btn bvi-btn--theme-white" data-bvi-theme="white">Черным по белому</button>
					<button type="button" class="bvi-btn bvi-btn--theme-black" data-bvi-theme="black">Белым по черному</button>
					<button type="button" class="bvi-btn bvi-btn--theme-blue" data-bvi-theme="blue">Синим по голубому</button>
				</div>
				<div class="bvi-panel__group">
					<span class="bvi-panel__label">Изображения:</span>
					<button type="button" class="bvi-btn" id="bvi-toggle-images">Вкл/Выкл фото</button>
				</div>
				<div class="bvi-panel__group">
					<button type="button" class="bvi-btn bvi-btn--close" id="bvi-close-panel">Обычная версия сайта</button>
				</div>
			</div>
		`;

		document.body.insertBefore(panel, document.body.firstChild);

		// Event handlers
		panel.querySelectorAll('[data-bvi-font]').forEach(btn => {
			btn.addEventListener('click', () => {
				settings.fontSize = btn.getAttribute('data-bvi-font');
				saveSettings();
				applySettings();
			});
		});

		panel.querySelectorAll('[data-bvi-theme]').forEach(btn => {
			btn.addEventListener('click', () => {
				settings.theme = btn.getAttribute('data-bvi-theme');
				saveSettings();
				applySettings();
			});
		});

		const imgBtn = document.getElementById('bvi-toggle-images');
		if (imgBtn) {
			imgBtn.addEventListener('click', () => {
				settings.hideImages = !settings.hideImages;
				saveSettings();
				applySettings();
			});
		}

		const closeBtn = document.getElementById('bvi-close-panel');
		if (closeBtn) {
			closeBtn.addEventListener('click', () => {
				settings.active = false;
				saveSettings();
				applySettings();
			});
		}
	}

	function init() {
		createPanel();
		applySettings();

		// Bind all buttons that toggle BVI
		document.querySelectorAll('.bvi-toggle-btn').forEach(btn => {
			btn.addEventListener('click', (e) => {
				e.preventDefault();
				settings.active = !settings.active;
				saveSettings();
				applySettings();
			});
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
