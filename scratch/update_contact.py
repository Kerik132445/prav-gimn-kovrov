import re

path = 'contact.html'
with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update department cards
old_dept = re.compile(r'<div class="contacts-departments__grid">.*?</div>\s*</section>', re.DOTALL)
new_dept = '''<div class="contacts-departments__grid">
			<div class="department-card">
				<span class="department-card__name">Приемная / Секретарь</span>
				<a class="department-card__phone" href="tel:+74923240195">8 (49232) 401-95</a>
				<span class="department-card__hours">Пн–Пт: 08:00 – 16:00</span>
			</div>
			<div class="department-card">
				<span class="department-card__name">Директор (моб.)</span>
				<a class="department-card__phone" href="tel:+79206225676">8-920-622-56-76</a>
				<span class="department-card__hours">прот. Михаил Бунтилов</span>
			</div>
			<div class="department-card">
				<span class="department-card__name">Завуч по УВР / Учительская</span>
				<a class="department-card__phone" href="tel:+74923242272">8 (49232) 422-72</a>
				<span class="department-card__hours">Пн–Пт: 08:30 – 16:00</span>
			</div>
			<div class="department-card">
				<span class="department-card__name">Бухгалтерия</span>
				<a class="department-card__phone" href="tel:+74923240195">8 (49232) 401-95</a>
				<span class="department-card__hours">Пн–Пт: 09:00 – 16:00</span>
			</div>
		</div>
	</section>'''

html = old_dept.sub(new_dept, html)

# 2. Update requisites
old_req = re.compile(r'<details class="requisites-accordion">.*?</div>\s*</details>', re.DOTALL)
new_req = '''<details class="requisites-accordion">
			<summary class="requisites-accordion__title">Юридическая информация и реквизиты организации</summary>
			<div class="requisites-accordion__content">
				<p><strong>Полное наименование:</strong> Частное общеобразовательное учреждение «Православная гимназия г. Коврова»</p>
				<p><strong>Краткое наименование:</strong> ЧОУ «Православная гимназия г. Коврова»</p>
				<p><strong>ОГРН:</strong> 1043302208223 | <strong>ИНН:</strong> 3305051862 | <strong>КПП:</strong> 330501001</p>
				<p><strong>Банк:</strong> Ульяновское отделение №8588 ПАО СБЕРБАНК</p>
				<p><strong>Расчетный счет:</strong> 40703810810000000118 | <strong>Корр. счет:</strong> 30101810000000000602 | <strong>БИК:</strong> 047308602</p>
				<p><strong>Назначение платежа:</strong> Пожертвование на уставную деятельность</p>
				<p><strong>Юридический и фактический адрес:</strong> 601909, Владимирская область, г. Ковров, ул. Подлесная, д. 10</p>
			</div>
		</details>'''

html = old_req.sub(new_req, html)

# 3. Update policy consent
old_policy = re.compile(r'<div class="form-footer">\s*<span class="policy-text">.*?</span>\s*<button class="btn-orange" type="submit">Отправить заявку</button>\s*</div>', re.DOTALL)
new_policy = '''<div class="form-footer">
					<label class="policy-checkbox-label" style="display:flex; align-items:center; gap:8px; font-size:13px; color:#475569; cursor:pointer;">
						<input type="checkbox" required checked style="accent-color:#2563eb; width:16px; height:16px;">
						<span>Согласен на <a href="policy.html" target="_blank" style="color:#0284c7; text-decoration:underline;">обработку персональных данных</a> (152-ФЗ)</span>
					</label>
					<button class="btn-orange" type="submit">Отправить заявку</button>
				</div>'''

html = old_policy.sub(new_policy, html)

with open(path, 'w', encoding='utf-8') as f:
    f.write(html)
print('Updated contact.html successfully!')
