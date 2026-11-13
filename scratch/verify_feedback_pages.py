import re

pages = [
    ('index.html', 'main'),
    ('apply.html', 'apply'),
    ('food.html', 'food'),
    ('class_schedule.html', 'schedule'),
    ('teachers.html', 'teachers'),
    ('documents.html', 'documents'),
    ('diary.html', 'diary'),
    ('contact.html', 'contact'),
    ('life.html', 'life')
]

all_ok = True
for fn, expected_page in pages:
    with open(fn, 'r', encoding='utf-8') as f:
        c = f.read()

    has_form = 'class="feedback__form"' in c
    has_page_attr = f'data-page="{expected_page}"' in c
    has_theme_select = '<select id="user-theme"' in c
    has_neutral_opt = 'Не выбрана — задам свой вопрос' in c
    has_consent_unchecked = 'checked' not in c[c.find('class="policy-checkbox-label"'):c.find('class="policy-checkbox-label"')+150]
    has_config_js = 'config.js' in c
    has_feedback_js = 'feedback.js' in c

    status = (has_form and has_page_attr and has_theme_select and has_neutral_opt and
              has_consent_unchecked and has_config_js and has_feedback_js)

    print(f"{fn} ({expected_page}): OK={status} | form={has_form}, data-page={has_page_attr}, select={has_theme_select}, neutral_opt={has_neutral_opt}, consent_uncheck={has_consent_unchecked}, scripts={has_config_js and has_feedback_js}")
    if not status:
        all_ok = False

if all_ok:
    print("\nALL PAGES VERIFIED SUCCESSFULLY!")
else:
    print("\nERRORS DETECTED ON SOME PAGES!")
