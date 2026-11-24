(function () {
	// Поддержка ручного переопределения через localStorage при необходимости тестирования
	try {
		const savedUrl = typeof localStorage !== "undefined" ? localStorage.getItem("API_BASE_URL") : null;
		if (savedUrl) {
			window.API_BASE_URL = savedUrl;
			return;
		}
	} catch (e) {
		// localStorage может быть заблокирован в некоторых sandbox/iframe
	}

	const isLocal = typeof window !== "undefined" && (
		window.location.hostname === "localhost" ||
		window.location.hostname === "127.0.0.1" ||
		window.location.protocol === "file:" ||
		!window.location.hostname
	);

	// Локально подключаемся к живому FastAPI на порту 8000.
	// На боевом домене используем относительные пути (reverse proxy /api), чтобы не зависеть от временных туннелей.
	window.API_BASE_URL = isLocal ? "http://127.0.0.1:8000" : "";
})();

