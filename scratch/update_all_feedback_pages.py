import re

STANDARD_FORM_TEMPLATE = '''				<form class="feedback__form" data-page="{page_key}">

					<div class="form-group">
						<label for="user-name">
							Ваше имя <span style="color:#ef4444;">*</span>
						</label>
						<input type="text" placeholder="Иван Иванов" id="user-name" maxlength="100" autocomplete="name" required>
					</div>

					<div class="form-group">
						<label for="user-contact">
							Номер телефона или Email <span style="color:#ef4444;">*</span>
						</label>
						<input type="text" placeholder="+7 (999) 123-45-67 или email@mail.ru" id="user-contact" maxlength="100" autocomplete="email tel" required>
					</div>

					<div class="form-group">
						<label for="user-theme">
							Тема обращения <span class="label-optional">(необязательно)</span>
						</label>
						<select id="user-theme" name="theme" class="form-select">
							<option value="">Не выбрана — задам свой вопрос</option>
						</select>
					</div>

					<div class="form-group">
						<label for="user-msg">
							Сообщение <span style="color:#ef4444;">*</span>
						</label>
						<textarea placeholder="Опишите подробно ваш вопрос..." id="user-msg" maxlength="3000" rows="4" required></textarea>
					</div>

					<div class="form-footer">
						<label class="policy-checkbox-label" style="display:flex; align-items:center; gap:8px; font-size:13px; color:#475569; cursor:pointer;">
							<input type="checkbox" id="user-consent" required style="accent-color:#2563eb; width:16px; height:16px;">
							<span>Согласен на <a href="policy.html" target="_blank" style="color:#0284c7; text-decoration:underline;">обработку персональных данных</a> (152-ФЗ)</span>
						</label>
						<button type="submit" class="btn-orange" id="feedback-submit-btn">Отправить обращение</button>
					</div>

					<div class="feedback-status" id="feedback-status" role="alert" aria-live="polite" style="display:none;"></div>

				</form>'''

pages_with_existing_section = {
    'index.html': 'main',
    'contact.html': 'contact',
    'class_schedule.html': 'schedule',
    'diary.html': 'diary',
    'documents.html': 'documents',
    'food.html': 'food',
    'teachers.html': 'teachers'
}

for fn, page_key in pages_with_existing_section.items():
    with open(fn, 'r', encoding='utf-8') as f:
        content = f.read()

    new_form = STANDARD_FORM_TEMPLATE.format(page_key=page_key)
    pattern = re.compile(r'<form class="feedback__form".*?>.*?</form>', re.DOTALL)
    if pattern.search(content):
        content = pattern.sub(new_form, content, count=1)
        print(f"Updated form in {fn} with data-page='{page_key}'")
    else:
        print(f"ERROR: Could not find form in {fn}")

    with open(fn, 'w', encoding='utf-8') as f:
        f.write(content)

print("Standard pages updated.")
