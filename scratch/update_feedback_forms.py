import re

STANDARD_FORM = '''				<form class="feedback__form">

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
							Тема обращения <span style="color:#ef4444;">*</span>
						</label>
						<input type="text" id="user-theme" placeholder="Например: Поступление в гимназию" list="theme-suggestions" maxlength="150" autocomplete="off" required>
						<datalist id="theme-suggestions">
							<option value="Поступление и приём документов">
							<option value="Вопросы по учебному процессу">
							<option value="Организация питания и ГПД">
							<option value="Внеурочные занятия и кружки">
							<option value="Другой вопрос">
						</datalist>
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

files_to_update_form = [
    'contact.html',
    'class_schedule.html',
    'diary.html',
    'documents.html',
    'food.html',
    'teachers.html'
]

for fn in files_to_update_form:
    with open(fn, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace <form class="feedback__form">...</form>
    pattern = re.compile(r'<form class="feedback__form".*?>.*?</form>', re.DOTALL)
    if pattern.search(content):
        content = pattern.sub(STANDARD_FORM, content, count=1)
        print(f"Updated form in {fn}")
    else:
        print(f"WARNING: Form pattern not found in {fn}")

    with open(fn, 'w', encoding='utf-8') as f:
        f.write(content)

# Now check and add scripts to all 7 pages: index.html + the 6 above
all_pages = ['index.html'] + files_to_update_form

for fn in all_pages:
    with open(fn, 'r', encoding='utf-8') as f:
        content = f.read()

    scripts_to_add = []
    if 'js/config.js' not in content:
        scripts_to_add.append('\t<script src="js/config.js"></script>')
    if 'js/feedback.js' not in content:
        scripts_to_add.append('\t<script src="js/feedback.js"></script>')

    if scripts_to_add:
        addition = '\n'.join(scripts_to_add) + '\n'
        # Add right before </body>
        if '</body>' in content:
            content = content.replace('</body>', f'{addition}</body>')
            print(f"Added scripts to {fn}: {scripts_to_add}")
            with open(fn, 'w', encoding='utf-8') as f:
                f.write(content)
        else:
            print(f"WARNING: </body> not found in {fn}")
    else:
        print(f"Scripts already present in {fn}")

print("All updates completed successfully!")
