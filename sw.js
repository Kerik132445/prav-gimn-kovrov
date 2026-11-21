/**
 * Service Worker для PWA Православной гимназии г. Коврова
 * Версия кэша: gymnasium-pwa-v1.0
 * Обеспечивает мгновенную загрузку и полную автономную работу без интернета.
 */

const CACHE_NAME = 'gymnasium-pwa-v1.0';

// Базовые ресурсы оболочки приложения (App Shell)
const STATIC_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './class_schedule.html',
  './food.html',
  './contact.html',
  './css/style.css?v=3.5',
  './css/calendar.css',
  './css/bvi.css?v=2.2',
  './js/calendar.js',
  './js/calendar-data.js',
  './js/navigation.js',
  './js/pwa.js',
  './assets/icons/logo_star.png',
  './assets/icons/favicon-32x32.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/pwa/icon-192.png',
  './assets/icons/pwa/icon-512.png',
  './assets/images/calendar/2026-11-21.jpg',
  './assets/images/calendar/spas_default.jpg'
];

// Установка: предварительное кэширование ядра приложения
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Игнорируем отдельные сбои предзагрузки, чтобы SW обязательно установился
      return Promise.allSettled(
        STATIC_ASSETS.map((url) =>
          cache.add(url).catch((err) => console.warn('[PWA SW] Pre-cache skip:', url, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// Активация: очистка старых версий кэша
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA SW] Удаление устаревшего кэша:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Обработка сетевых запросов
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Игнорируем не-GET запросы и chrome-extension схемы
  if (req.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // 1. Навигационные запросы к HTML страницам: Network-First с переходом на офлайн страницу
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(async () => {
          const cachedRes = await caches.match(req);
          if (cachedRes) return cachedRes;
          // Если страницы нет в кэше — выдаем фирменную офлайн-страницу
          return caches.match('./offline.html');
        })
    );
    return;
  }

  // 2. API запросы (например /api/calendar): Network-First с сохранением в кэш
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // 3. Статические ресурсы (CSS, JS, Изображения, Шрифты): Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then((cachedRes) => {
      const fetchPromise = fetch(req)
        .then((networkRes) => {
          if (networkRes.status === 200 && networkRes.type === 'basic') {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return networkRes;
        })
        .catch(() => {/* Игнорируем офлайн-ошибки фонового обновления */});

      // Возвращаем из кэша мгновенно, либо ждём сеть
      return cachedRes || fetchPromise;
    })
  );
});
