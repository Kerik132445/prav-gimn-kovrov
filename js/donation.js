/**
 * donation.js - Интерактивный функционал блока помощи гимназии
 * (копирование реквизитов в буфер, скачивание .txt, доступность)
 */
document.addEventListener('DOMContentLoaded', function () {
	var copyButtons = document.querySelectorAll('.requisite-copy-btn');
	var toast = document.getElementById('donation-toast');
	var toastTimeout = null;

	function showToast(message) {
		if (!toast) return;
		toast.textContent = message;
		toast.classList.add('donation-toast--visible');
		if (toastTimeout) clearTimeout(toastTimeout);
		toastTimeout = setTimeout(function () {
			toast.classList.remove('donation-toast--visible');
		}, 2500);
	}

	function fallbackCopy(text, callback) {
		var textArea = document.createElement('textarea');
		textArea.value = text;
		textArea.style.position = 'fixed';
		textArea.style.left = '-9999px';
		textArea.style.top = '0';
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		try {
			var successful = document.execCommand('copy');
			if (successful && callback) callback();
		} catch (err) {
			console.error('Ошибка копирования:', err);
		}
		document.body.removeChild(textArea);
	}

	copyButtons.forEach(function (btn) {
		btn.addEventListener('click', function () {
			var textToCopy = btn.getAttribute('data-copy');
			if (!textToCopy) return;

			var originalHtml = btn.innerHTML;

			function markSuccess() {
				btn.classList.add('copied');
				btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg> <span class="copy-text">Скопировано!</span>';
				btn.setAttribute('aria-label', 'Скопировано в буфер обмена');
				showToast('Скопировано: ' + textToCopy);

				setTimeout(function () {
					btn.classList.remove('copied');
					btn.innerHTML = originalHtml;
					btn.setAttribute('aria-label', 'Скопировать ' + textToCopy);
				}, 2000);
			}

			if (navigator.clipboard && window.isSecureContext) {
				navigator.clipboard.writeText(textToCopy).then(markSuccess).catch(function () {
					fallbackCopy(textToCopy, markSuccess);
				});
			} else {
				fallbackCopy(textToCopy, markSuccess);
			}
		});
	});

	// Скачивание реквизитов в текстовом файле (.txt)
	var downloadBtn = document.getElementById('download-requisites-btn');
	if (downloadBtn) {
		downloadBtn.addEventListener('click', function () {
			var requisitesText = [
				'ЧОУ «Православная гимназия г. Коврова»',
				'Реквизиты для добровольного пожертвования на уставную деятельность',
				'============================================================',
				'Организация: ЧОУ «Православная гимназия г. Коврова»',
				'ИНН: 3305051862',
				'КПП: 330501001',
				'ОГРН: 1073300002131',
				'Расчётный счёт (р/с): 40703810810000000118',
				'Банк: Ульяновское отделение №8588 ПАО СБЕРБАНК',
				'Корреспондентский счёт (к/с): 30101810000000000602',
				'БИК: 047308602',
				'Назначение платежа: Пожертвование на уставную деятельность',
				'------------------------------------------------------------',
				'Юридический адрес: 601909, Владимирская область, г. Ковров, ул. Подлесная, д. 10',
				'Контакты приемной: +7 (49232) 4-01-95, +7 (920) 622-56-76',
				'Электронная почта: sretenskajgimn@yandex.ru'
			].join('\r\n');

			var blob = new Blob([requisitesText], { type: 'text/plain;charset=utf-8' });
			var url = URL.createObjectURL(blob);
			var a = document.createElement('a');
			a.href = url;
			a.download = 'Реквизиты_Православная_гимназия_Ковров.txt';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			showToast('Файл с реквизитами скачан');
		});
	}
});
