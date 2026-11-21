/**
 * Управление PWA (Progressive Web App) для Православной гимназии г. Коврова
 * - Регистрация Service Worker (офлайн-режим)
 * - Поддержка нативной установки (beforeinstallprompt)
 * - Обработка кнопок установки в футере и мобильном меню (.js-pwa-install)
 * - Интерактивное обучающее модальное окно с инструкциями для iOS, Android и ПК
 */

(function () {
  'use strict';

  let deferredPrompt = null;
  let guideModalElement = null;

  // 1. Регистрация Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' })
        .then((registration) => {
          console.log('[PWA] Service Worker успешно зарегистрирован:', registration.scope);
        })
        .catch((error) => {
          console.warn('[PWA] Ошибка регистрации Service Worker:', error);
        });
    });
  }

  // 2. Всплывающая плашка установки (только если доступен prompt и не была закрыта)
  function createInstallBanner() {
    if (document.getElementById('pwa-install-banner')) return;

    // Проверяем, не закрывал ли пользователь плашку недавно
    const dismissedUntil = localStorage.getItem('pwa_install_dismissed_until');
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return;
    }

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.className = 'pwa-install-banner';
    banner.innerHTML = `
      <div class="pwa-install-banner__content">
        <div class="pwa-install-banner__icon">
          <img src="assets/icons/pwa/icon-192.png" alt="Гимназия Ковров" width="40" height="40">
        </div>
        <div class="pwa-install-banner__text">
          <div class="pwa-install-banner__title">Приложение гимназии</div>
          <div class="pwa-install-banner__desc">Быстрый доступ к расписанию и календарю без интернета</div>
        </div>
        <div class="pwa-install-banner__actions">
          <button type="button" class="pwa-install-banner__btn-install" id="pwa-btn-install">
            Установить
          </button>
          <button type="button" class="pwa-install-banner__btn-close" id="pwa-btn-close" aria-label="Закрыть">
            ✕
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    requestAnimationFrame(() => {
      banner.classList.add('pwa-install-banner--visible');
    });

    const btnInstall = document.getElementById('pwa-btn-install');
    if (btnInstall) {
      btnInstall.addEventListener('click', async () => {
        if (!deferredPrompt) {
          banner.remove();
          showPwaGuideModal();
          return;
        }

        banner.classList.remove('pwa-install-banner--visible');
        deferredPrompt.prompt();

        const { outcome } = await deferredPrompt.userChoice;
        console.log('[PWA] Результат установки:', outcome);
        deferredPrompt = null;
        setTimeout(() => banner.remove(), 300);
      });
    }

    const btnClose = document.getElementById('pwa-btn-close');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        banner.classList.remove('pwa-install-banner--visible');
        // Запоминаем закрытие на 7 дней
        localStorage.setItem('pwa_install_dismissed_until', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
        setTimeout(() => banner.remove(), 300);
      });
    }
  }

  // 3. Отслеживание события готовности к установке браузера (Android / Chrome / Edge)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    createInstallBanner();
  });

  // 4. Отслеживание успешной установки
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] Приложение Православной гимназии успешно установлено!');
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.remove();
    deferredPrompt = null;
    closePwaGuideModal();
  });

  // 5. Определение платформы устройства (iOS, Android, Desktop)
  function detectPlatform() {
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (isIOS) return 'ios';

    const isAndroid = /Android/i.test(ua);
    if (isAndroid) return 'android';

    return 'desktop';
  }

  // 6. Интерактивное обучающее модальное окно установки
  function showPwaGuideModal() {
    if (!guideModalElement) {
      buildGuideModal();
    }

    const platform = detectPlatform();
    switchTab(platform);

    guideModalElement.classList.add('pwa-modal-overlay--active');
    document.body.style.overflow = 'hidden';
  }

  function closePwaGuideModal() {
    if (!guideModalElement) return;
    guideModalElement.classList.remove('pwa-modal-overlay--active');
    document.body.style.overflow = '';
  }

  function switchTab(tabKey) {
    if (!guideModalElement) return;
    const tabs = guideModalElement.querySelectorAll('.pwa-modal__tab');
    const panels = guideModalElement.querySelectorAll('.pwa-modal__panel');

    tabs.forEach(t => {
      const active = t.getAttribute('data-tab') === tabKey;
      t.classList.toggle('pwa-modal__tab--active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    panels.forEach(p => {
      const active = p.getAttribute('data-panel') === tabKey;
      p.classList.toggle('pwa-modal__panel--active', active);
    });
  }

  function buildGuideModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'pwa-guide-modal';
    modalOverlay.className = 'pwa-modal-overlay';
    modalOverlay.setAttribute('role', 'dialog');
    modalOverlay.setAttribute('aria-modal', 'true');
    modalOverlay.setAttribute('aria-labelledby', 'pwa-modal-title');

    modalOverlay.innerHTML = `
      <div class="pwa-modal">
        <button type="button" class="pwa-modal__close" id="pwa-modal-close" aria-label="Закрыть">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="pwa-modal__header">
          <div class="pwa-modal__icon">
            <img src="assets/icons/pwa/icon-192.png" alt="Логотип гимназии" width="48" height="48">
          </div>
          <div class="pwa-modal__header-text">
            <h3 class="pwa-modal__title" id="pwa-modal-title">Приложение гимназии</h3>
            <p class="pwa-modal__subtitle">Установка на экран телефона или рабочий стол ПК</p>
          </div>
        </div>

        <div class="pwa-modal__benefits">
          <div class="pwa-benefit">
            <span class="pwa-benefit__check">✓</span>
            <span>Работает без интернета</span>
          </div>
          <div class="pwa-benefit">
            <span class="pwa-benefit__check">✓</span>
            <span>Быстрый доступ к расписанию</span>
          </div>
          <div class="pwa-benefit">
            <span class="pwa-benefit__check">✓</span>
            <span>Без рекламы и регистрации</span>
          </div>
        </div>

        <div class="pwa-modal__tabs" role="tablist">
          <button type="button" class="pwa-modal__tab" data-tab="ios" role="tab">iPhone / iPad</button>
          <button type="button" class="pwa-modal__tab" data-tab="android" role="tab">Android</button>
          <button type="button" class="pwa-modal__tab" data-tab="desktop" role="tab">Компьютер</button>
        </div>

        <div class="pwa-modal__tab-panels">
          <!-- iOS Safari -->
          <div class="pwa-modal__panel" data-panel="ios" role="tabpanel">
            <div class="pwa-step">
              <div class="pwa-step__num">1</div>
              <div class="pwa-step__text">Откройте сайт гимназии в браузере <strong>Safari</strong> на вашем iPhone или iPad.</div>
            </div>
            <div class="pwa-step">
              <div class="pwa-step__num">2</div>
              <div class="pwa-step__text">Нажмите кнопку <strong>«Поделиться»</strong> <span class="pwa-step__badge">⎋</span> (значок квадрата со стрелочкой вверх) внизу экрана.</div>
            </div>
            <div class="pwa-step">
              <div class="pwa-step__num">3</div>
              <div class="pwa-step__text">В меню прокрутите вниз и выберите <strong>«На экран „Домой“»</strong> <span class="pwa-step__badge">⊞</span>, затем нажмите <strong>«Добавить»</strong>.</div>
            </div>
          </div>

          <!-- Android -->
          <div class="pwa-modal__panel" data-panel="android" role="tabpanel">
            <div class="pwa-step">
              <div class="pwa-step__num">1</div>
              <div class="pwa-step__text">В браузере (Chrome / Яндекс) нажмите на <strong>три точки</strong> <span class="pwa-step__badge">⋮</span> в правом верхнем углу.</div>
            </div>
            <div class="pwa-step">
              <div class="pwa-step__num">2</div>
              <div class="pwa-step__text">Выберите пункт меню <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>.</div>
            </div>
            <div class="pwa-step">
              <div class="pwa-step__num">3</div>
              <div class="pwa-step__text">Подтвердите добавление — иконка гимназии появится среди приложений смартфона.</div>
            </div>
          </div>

          <!-- Desktop ПК -->
          <div class="pwa-modal__panel" data-panel="desktop" role="tabpanel">
            <div class="pwa-step">
              <div class="pwa-step__num">1</div>
              <div class="pwa-step__text">В адресной строке браузера (Chrome, Edge, Яндекс) справа найдите значок <strong>«Установить»</strong> <span class="pwa-step__badge">⊕</span>.</div>
            </div>
            <div class="pwa-step">
              <div class="pwa-step__num">2</div>
              <div class="pwa-step__text">Нажмите кнопку <strong>«Установить»</strong> во всплывающем подтверждении.</div>
            </div>
            <div class="pwa-step">
              <div class="pwa-step__num">3</div>
              <div class="pwa-step__text">Сайт откроется как отдельное быстрое приложение в панели задач Windows / Mac.</div>
            </div>
          </div>
        </div>

        <div class="pwa-modal__footer">
          <button type="button" class="pwa-modal__btn-primary" id="pwa-modal-action-btn">
            Понятно
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);
    guideModalElement = modalOverlay;

    // Переключение вкладок
    modalOverlay.querySelectorAll('.pwa-modal__tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabKey = tab.getAttribute('data-tab');
        switchTab(tabKey);
      });
    });

    // Закрытие
    const btnClose = modalOverlay.querySelector('#pwa-modal-close');
    if (btnClose) btnClose.addEventListener('click', closePwaGuideModal);

    const btnAction = modalOverlay.querySelector('#pwa-modal-action-btn');
    if (btnAction) {
      btnAction.addEventListener('click', () => {
        if (deferredPrompt) {
          closePwaGuideModal();
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
        } else {
          closePwaGuideModal();
        }
      });
    }

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closePwaGuideModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && guideModalElement && guideModalElement.classList.contains('pwa-modal-overlay--active')) {
        closePwaGuideModal();
      }
    });
  }

  // 7. Единый обработчик клика для всех кнопок установки на сайте (.js-pwa-install)
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('.js-pwa-install');
    if (!trigger) return;

    e.preventDefault();

    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(({ outcome }) => {
        console.log('[PWA] Результат вызова установки:', outcome);
        if (outcome === 'accepted') {
          deferredPrompt = null;
          const banner = document.getElementById('pwa-install-banner');
          if (banner) banner.remove();
        }
      });
    } else {
      showPwaGuideModal();
    }
  });

  // 8. Внедрение стилей
  function injectPwaStyles() {
    if (document.getElementById('pwa-injected-styles')) return;

    const style = document.createElement('style');
    style.id = 'pwa-injected-styles';
    style.textContent = `
      /* --- Кнопка в верхней строке футера --- */
      .footer-top-actions {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      .footer-app-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.16);
        border-radius: 999px;
        color: #FFFFFF;
        font-size: 13.5px;
        font-weight: 600;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.22s ease;
        text-decoration: none;
        line-height: 1;
      }
      .footer-app-btn:hover {
        background: rgba(255, 255, 255, 0.18);
        border-color: rgba(255, 255, 255, 0.35);
        transform: translateY(-2px);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
        color: #FFFFFF;
      }
      .footer-app-btn:active {
        transform: translateY(0);
      }
      .footer-app-btn__icon {
        color: #93C5FD;
        flex-shrink: 0;
        transition: transform 0.2s ease;
      }
      .footer-app-btn:hover .footer-app-btn__icon {
        transform: scale(1.1);
      }

      /* --- Текстовая кнопка-ссылка в колонке навигации футера --- */
      .footer-pwa-link-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: none;
        border: none;
        padding: 0;
        color: #94A3B8;
        font-size: 14px;
        font-family: inherit;
        cursor: pointer;
        text-align: left;
        transition: color 0.2s ease, transform 0.2s ease;
      }
      .footer-pwa-link-btn:hover {
        color: #FFFFFF;
        transform: translateX(2px);
      }
      .footer-pwa-link-btn svg {
        color: #60A5FA;
        flex-shrink: 0;
      }

      /* --- Кнопка в мобильной шторке (Drawer) --- */
      .mobile-drawer__pwa-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        min-height: 46px;
        padding: 10px 14px;
        border-radius: 10px;
        border: none;
        background: #1E3A8A;
        color: #FFFFFF;
        font-size: 14.5px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(30, 58, 138, 0.25);
        transition: background 0.2s ease, transform 0.15s ease;
        font-family: inherit;
      }
      .mobile-drawer__pwa-btn:hover {
        background: #172554;
        transform: translateY(-1px);
      }
      .mobile-drawer__pwa-btn:active {
        transform: translateY(0);
      }

      /* --- Всплывающая плашка установки --- */
      .pwa-install-banner {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999;
        max-width: 440px;
        background: #FFFFFF;
        border: 1px solid #EAE3D6;
        border-radius: 18px;
        box-shadow: 0 16px 40px -10px rgba(28, 25, 23, 0.18), 0 2px 8px rgba(28, 25, 23, 0.06);
        padding: 12px 16px;
        opacity: 0;
        transform: translateY(20px) scale(0.97);
        pointer-events: none;
        transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: 'Inter', -apple-system, sans-serif;
      }
      .pwa-install-banner--visible {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      .pwa-install-banner__content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .pwa-install-banner__icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        overflow: hidden;
        flex-shrink: 0;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      }
      .pwa-install-banner__icon img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .pwa-install-banner__text {
        flex: 1;
        min-width: 0;
      }
      .pwa-install-banner__title {
        font-size: 13.5px;
        font-weight: 700;
        color: #1E1A17;
        line-height: 1.25;
      }
      .pwa-install-banner__desc {
        font-size: 11.5px;
        color: #6E6255;
        line-height: 1.35;
        margin-top: 2px;
      }
      .pwa-install-banner__actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      .pwa-install-banner__btn-install {
        padding: 8px 14px;
        background: #1E3A8A;
        color: #FFFFFF;
        font-size: 12.5px;
        font-weight: 700;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(30, 58, 138, 0.25);
        transition: all 0.18s ease;
      }
      .pwa-install-banner__btn-install:hover {
        background: #172554;
        transform: translateY(-1px);
      }
      .pwa-install-banner__btn-close {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        border-radius: 50%;
        color: #8C7D6F;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.15s ease;
      }
      .pwa-install-banner__btn-close:hover {
        background: #F0EAE1;
        color: #1E1A17;
      }

      /* --- Обучающее модальное окно (PWA Guide Modal) --- */
      .pwa-modal-overlay {
        position: fixed;
        inset: 0;
        z-index: 100000;
        background: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.24s ease, visibility 0.24s ease;
        font-family: 'Inter', -apple-system, sans-serif;
      }
      .pwa-modal-overlay--active {
        opacity: 1;
        visibility: visible;
      }
      .pwa-modal {
        position: relative;
        width: 100%;
        max-width: 480px;
        background: #FFFFFF;
        border: 1px solid #EAE3D6;
        border-radius: 20px;
        box-shadow: 0 24px 60px -12px rgba(15, 23, 42, 0.25);
        padding: 24px 24px 20px;
        transform: translateY(16px) scale(0.98);
        transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        max-height: 90vh;
        overflow-y: auto;
      }
      .pwa-modal-overlay--active .pwa-modal {
        transform: translateY(0) scale(1);
      }
      .pwa-modal__close {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background: #F1F5F9;
        color: #64748B;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
      }
      .pwa-modal__close:hover {
        background: #E2E8F0;
        color: #0F172A;
      }
      .pwa-modal__header {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 16px;
        padding-right: 32px;
      }
      .pwa-modal__icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        overflow: hidden;
        flex-shrink: 0;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }
      .pwa-modal__icon img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .pwa-modal__title {
        font-size: 18px;
        font-weight: 700;
        color: #0F172A;
        line-height: 1.25;
        margin: 0;
      }
      .pwa-modal__subtitle {
        font-size: 12.5px;
        color: #64748B;
        line-height: 1.4;
        margin: 3px 0 0;
      }
      .pwa-modal__benefits {
        display: flex;
        flex-direction: column;
        gap: 6px;
        background: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 12px;
        padding: 10px 14px;
        margin-bottom: 18px;
      }
      .pwa-benefit {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12.5px;
        color: #334155;
      }
      .pwa-benefit__check {
        color: #10B981;
        font-weight: 800;
        font-size: 13px;
      }
      .pwa-modal__tabs {
        display: flex;
        background: #F1F5F9;
        border-radius: 10px;
        padding: 3px;
        gap: 3px;
        margin-bottom: 16px;
      }
      .pwa-modal__tab {
        flex: 1;
        padding: 8px 10px;
        font-size: 12.5px;
        font-weight: 600;
        color: #64748B;
        background: transparent;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.18s ease;
        text-align: center;
        font-family: inherit;
      }
      .pwa-modal__tab--active {
        background: #FFFFFF;
        color: #1E3A8A;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      }
      .pwa-modal__panel {
        display: none;
        flex-direction: column;
        gap: 12px;
        min-height: 150px;
      }
      .pwa-modal__panel--active {
        display: flex;
      }
      .pwa-step {
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }
      .pwa-step__num {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #EEF2FF;
        color: #1E3A8A;
        font-size: 12px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 1px;
      }
      .pwa-step__text {
        font-size: 13.5px;
        color: #1E293B;
        line-height: 1.5;
      }
      .pwa-step__badge {
        display: inline-block;
        padding: 1px 6px;
        background: #F1F5F9;
        border: 1px solid #CBD5E1;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 700;
        color: #0F172A;
      }
      .pwa-modal__footer {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid #E2E8F0;
        display: flex;
        justify-content: flex-end;
      }
      .pwa-modal__btn-primary {
        width: 100%;
        padding: 11px 20px;
        background: #1E3A8A;
        color: #FFFFFF;
        font-size: 14px;
        font-weight: 600;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        transition: background 0.18s ease;
        font-family: inherit;
      }
      .pwa-modal__btn-primary:hover {
        background: #172554;
      }

      @media (max-width: 520px) {
        .pwa-install-banner {
          bottom: 16px;
          right: 16px;
          left: 16px;
          max-width: none;
        }
        .footer-top-actions {
          width: 100%;
          justify-content: space-between;
        }
      }
    `;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectPwaStyles);
  } else {
    injectPwaStyles();
  }
})();
