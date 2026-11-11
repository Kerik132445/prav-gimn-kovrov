import re

# ==============================================================================
# 1. Update dairy.html
# ==============================================================================
with open('dairy.html', 'r', encoding='utf-8') as f:
    dairy = f.read()

# Replace button link
dairy = dairy.replace(
    '<a class="btn-blue" href="#">Войти в дневник (БАРС)</a>',
    '<a class="btn-blue" href="https://xn--80aaacg2ahnrfcm1czh.xn--p1ai/" target="_blank" rel="noopener noreferrer">Войти в дневник (БАРС)</a>'
)

# Replace consent
old_consent = '<div class="form-footer">\n<span class="policy-text">Согласен на обработку персональных данных</span>\n<button class="btn-orange" type="submit">Отправить заявку</button>\n</div>'
new_consent = '''<div class="form-footer">
<label class="policy-checkbox-label" style="display:flex; align-items:center; gap:8px; font-size:13px; color:#475569; cursor:pointer;">
<input type="checkbox" required checked style="accent-color:#2563eb; width:16px; height:16px;">
<span>Согласен на <a href="policy.html" target="_blank" style="color:#0284c7; text-decoration:underline;">обработку персональных данных</a> (152-ФЗ)</span>
</label>
<button class="btn-orange" type="submit">Отправить заявку</button>
</div>'''

if old_consent in dairy:
    dairy = dairy.replace(old_consent, new_consent)
else:
    dairy = re.sub(
        r'<div class="form-footer">\s*<span class="policy-text">.*?</span>\s*<button class="btn-orange" type="submit">Отправить заявку</button>\s*</div>',
        new_consent,
        dairy,
        flags=re.DOTALL
    )

with open('dairy.html', 'w', encoding='utf-8') as f:
    f.write(dairy)
print('Updated dairy.html')


# ==============================================================================
# 2. Update food.html
# ==============================================================================
with open('food.html', 'r', encoding='utf-8') as f:
    food = f.read()

# Replace fake contacts with real ones
old_food_contacts = re.compile(
    r'<div class="contacts-card">.*?</div>\s*</div>\s*</div>\s*</section>',
    re.DOTALL
)

new_food_contacts = '''<div class="contacts-card">
				<div class="contacts-card__hotline">
					<h3 class="contacts-card__subtitle">Горячая линия по школьному питанию</h3>
					<a class="contacts-card__phone" href="tel:88002009185">8 (800) 200-91-85</a>
					<p class="contacts-card__note">Минпросвещения РФ (звонок бесплатный)</p>
				</div>
				<div class="contacts-card__persons">
					<p class="contacts-card__person">
						<strong>Ответственный за питание:</strong> Ткаченко Ирина Николаевна (зам. директора по УВР)
						<a href="tel:+74923240195">8 (49232) 401-95</a>
					</p>
					<p class="contacts-card__person">
						<strong>Директор гимназии:</strong> протоиерей Михаил Бунтилов
						<a href="tel:+79206225676">8-920-622-56-76</a>
					</p>
				</div>
			</div>
		</div>
	</section>'''

food = old_food_contacts.sub(new_food_contacts, food)

# Replace document cards with link to catering
old_food_docs = re.compile(r'<div class="docs-list">.*?</div>\s*</div>', re.DOTALL)
new_food_docs = '''<div class="docs-list">
				<a class="doc-card" href="sveden/catering.html">
					<img alt="Документ" class="doc-card__icon" src="assets/icons/download-documents.svg" />
					<span class="doc-card__title">Официальный раздел: Организация питания в образовательной организации</span>
					<span class="doc-card__meta">Сведения об условиях питания, трапезных и меню</span>
				</a>
				<a class="doc-card" href="documents/%D0%A0%D0%B5%D0%B6%D0%B8%D0%BC%20%D0%B7%D0%B0%D0%BD%D1%8F%D1%82%D0%B8%D0%B9%20%D0%BE%D0%B1%D1%83%D1%87%D0%B0%D1%8E%D1%89%D0%B8%D1%85%D1%81%D1%8F%2025.pdf" target="_blank">
					<img alt="Скачать" class="doc-card__icon" src="assets/icons/download-documents.svg" />
					<span class="doc-card__title">Режим занятий обучающихся и график питания</span>
					<span class="doc-card__meta">PDF, 420 КБ</span>
				</a>
				<a class="doc-card" href="documents/%D0%9F%D1%83%D0%B1%D0%BB%D0%B8%D1%87%D0%BD%D0%B0%D1%8F%20%D0%BE%D1%84%D0%B5%D1%80%D1%82%D0%B0%20%D0%BE%20%D0%B7%D0%B0%D0%BA%D0%BB%D1%8E%D1%87%D0%B5%D0%BD%D0%B8%D0%B8%20%D0%B4%D0%BE%D0%B3%D0%BE%D0%B2%D0%BE%D1%80%D0%B0%20%D0%B4%D0%BE%D0%B1%D1%80%D0%BE%D0%B2%D0%BE%D0%BB%D1%8C%D0%BD%D0%BE%D0%B3%D0%BE%20%D0%BF%D0%BE%D0%B6%D0%B5%D1%80%D1%82%D0%B2%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F.pdf" target="_blank">
					<img alt="Скачать" class="doc-card__icon" src="assets/icons/download-documents.svg" />
					<span class="doc-card__title">Договор с ГБУЗ ВО «Ковровская городская больница №2»</span>
					<span class="doc-card__meta">Медицинское обслуживание (2 медработника)</span>
				</a>
			</div>
		</div>'''

food = old_food_docs.sub(new_food_docs, food)

# Replace consent in food.html
food = re.sub(
    r'<div class="form-footer">\s*<span class="policy-text">.*?</span>\s*<button class="btn-orange" type="submit">Отправить заявку</button>\s*</div>',
    new_consent,
    food,
    flags=re.DOTALL
)

with open('food.html', 'w', encoding='utf-8') as f:
    f.write(food)
print('Updated food.html')


# ==============================================================================
# 3. Update apply.html
# ==============================================================================
with open('apply.html', 'r', encoding='utf-8') as f:
    apply_h = f.read()

apply_h = re.sub(
    r'<div class="form-footer">\s*<button class="btn-orange" type="submit">Отправить заявку</button>\s*<span class="policy-text">.*?</span>\s*</div>',
    '''<div class="form-footer">
<label class="policy-checkbox-label" style="display:flex; align-items:center; gap:8px; font-size:13px; color:#475569; cursor:pointer;">
<input type="checkbox" required checked style="accent-color:#2563eb; width:16px; height:16px;">
<span>Согласен на <a href="policy.html" target="_blank" style="color:#0284c7; text-decoration:underline;">обработку персональных данных</a> (152-ФЗ)</span>
</label>
<button class="btn-orange" type="submit">Отправить заявку</button>
</div>''',
    apply_h,
    flags=re.DOTALL
)

with open('apply.html', 'w', encoding='utf-8') as f:
    f.write(apply_h)
print('Updated apply.html')


# ==============================================================================
# 4. Update index.html, teachers.html, documents.html, class_schedule.html consent
# ==============================================================================
for fname in ['index.html', 'teachers.html', 'documents.html', 'class_schedule.html']:
    with open(fname, 'r', encoding='utf-8') as f:
        c = f.read()

    new_c = re.sub(
        r'<div class="form-footer">\s*<span class="policy-text">.*?</span>\s*<button class="btn-orange" type="submit">Отправить заявку</button>\s*</div>',
        new_consent,
        c,
        flags=re.DOTALL
    )
    if new_c != c:
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(new_c)
        print(f'Updated consent in {fname}')
