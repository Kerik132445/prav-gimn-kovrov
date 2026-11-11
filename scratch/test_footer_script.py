# test footer script
import re

def update_footer(file_path, is_sveden=False):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find footer tail: from either <div class="footer-bottom"> or <div class="footer-copyright"> up to </footer>
    pattern = r'(<div class="footer-bottom"[\s\S]*?</footer>|<div class="footer-copyright"[\s\S]*?</footer>)'
    
    prefix = '../' if is_sveden else ''
    sveden_link = 'index.html' if is_sveden else 'sveden/index.html'
    faq_link = '../index.html#faq' if is_sveden else 'index.html#faq'
    home_link = '../index.html' if is_sveden else 'index.html'
    
    new_tail = f"""<div class="footer-bottom">
				<div class="footer-container">
					<div class="footer-top-row">
						<a href="{home_link}" class="brand__footer">
							<img src="{prefix}assets/icons/logo_star.png" alt="Логотип гимназии" class="brand__logo__footer" width="48" height="48">
							<div class="brand__info__footer">
								<span class="brand__title__footer">Православная гимназия г. Коврова</span>
								<span class="brand__subtitle__footer">Частное общеобразовательное учреждение</span>
							</div>
						</a>

						<div class="btn_media">
							<ul class="btn_media__list">
								<li class="media__list-vk">
									<a href="https://vk.com" target="_blank" rel="noopener noreferrer" aria-label="Мы ВКонтакте">
										<img src="{prefix}assets/icons/vk_icon.svg" alt="ВКонтакте" width="20" height="20">
									</a>
								</li>
								<li class="media__list-max">
									<a href="#" aria-label="Мессенджер">
										<img src="{prefix}assets/icons/images-Photoroom.png" alt="Мессенджер" width="20" height="20">
									</a>
								</li>
								<li class="media__list-whp">
									<a href="https://wa.me/74923240195" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
										<img src="{prefix}assets/icons/whatsap_icon.svg" alt="WhatsApp" width="20" height="20">
									</a>
								</li>
							</ul>
						</div>
					</div>

					<div class="footer-divider"></div>

					<div class="footer-nav-grid">
						<div class="footer-col">
							<h3 class="footer-col__title">О гимназии</h3>
							<ul class="footer-col__list">
								<li><a href="{prefix}story_school.html">История гимназии</a></li>
								<li><a href="{sveden_link}">Сведения об организации</a></li>
								<li><a href="{prefix}teachers.html">Учителя</a></li>
								<li><a href="{prefix}contact.html">Контакты</a></li>
							</ul>
						</div>

						<div class="footer-col">
							<h3 class="footer-col__title">Обучение</h3>
							<ul class="footer-col__list">
								<li><a href="{prefix}class_schedule.html">Расписание</a></li>
								<li><a href="{prefix}food.html">Школьное питание</a></li>
								<li><a href="{prefix}documents.html">Документы</a></li>
								<li><a href="{prefix}dairy.html">Электронный дневник</a></li>
							</ul>
						</div>

						<div class="footer-col">
							<h3 class="footer-col__title">Информация</h3>
							<ul class="footer-col__list">
								<li><a href="{prefix}news.html">Новости</a></li>
								<li><a href="{prefix}life.html">Жизнь гимназии</a></li>
								<li><a href="{faq_link}">Частые вопросы (FAQ)</a></li>
								<li><a href="{prefix}apply.html">Поступающим</a></li>
							</ul>
						</div>
					</div>

					<div class="footer-divider"></div>

					<div class="footer-contacts-bar">
						<div class="footer-contact-item">
							<svg class="footer-contact-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
								<circle cx="12" cy="10" r="3"></circle>
							</svg>
							<div class="footer-contact-item__content">
								<span class="footer-contact-item__label">Адрес</span>
								<span class="footer-contact-item__text">601909, Владимирская обл., г. Ковров, ул. Подлесная, д. 10</span>
							</div>
						</div>

						<div class="footer-contact-item">
							<svg class="footer-contact-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
							</svg>
							<div class="footer-contact-item__content">
								<span class="footer-contact-item__label">Телефон</span>
								<div class="footer-contact-item__phones">
									<a href="tel:+74923240195" class="footer-contact-item__link">+7 (49232) 4-01-95</a>,
									<a href="tel:+74923242272" class="footer-contact-item__link">4-22-72</a>
								</div>
							</div>
						</div>

						<div class="footer-contact-item">
							<svg class="footer-contact-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
								<polyline points="22,6 12,13 2,6"></polyline>
							</svg>
							<div class="footer-contact-item__content">
								<span class="footer-contact-item__label">Электронная почта</span>
								<a href="mailto:sretenskajgimn@yandex.ru" class="footer-contact-item__link">sretenskajgimn@yandex.ru</a>
							</div>
						</div>
					</div>

					<div class="footer-divider"></div>

					<div class="footer-copyright">
						<span class="footer-copyright__text">© 2026 Православная гимназия. Все права защищены.</span>
						<a href="{prefix}policy.html" class="footer-copyright__policy">Политика конфиденциальности</a>
					</div>
				</div>
			</div>
		</footer>"""

    new_content, count = re.subn(pattern, new_tail, content, count=1)
    if count == 0:
        print(f"FAILED: {file_path}")
        return False
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"SUCCESS: {file_path}")
    return True

if __name__ == '__main__':
    update_footer('index.html', is_sveden=False)
    update_footer('sveden/index.html', is_sveden=True)
