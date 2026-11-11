import re

def update_form_footer(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    # match <div class="form-footer"> ... <span class="policy-text"> ... <button ...> ... </div>
    pattern = re.compile(
        r'<div class="form-footer">\s*<span class="policy-text">.*?</span>\s*<button type="submit" class="btn-orange">\s*(.*?)\s*</button>\s*</div>',
        re.DOTALL
    )

    def repl(m):
        btn_text = m.group(1).strip()
        return f'''<div class="form-footer">
						<label class="policy-checkbox-label" style="display:flex; align-items:center; gap:8px; font-size:13px; color:#475569; cursor:pointer;">
							<input type="checkbox" required checked style="accent-color:#2563eb; width:16px; height:16px;">
							<span>Согласен на <a href="policy.html" target="_blank" style="color:#0284c7; text-decoration:underline;">обработку персональных данных</a> (152-ФЗ)</span>
						</label>
						<button type="submit" class="btn-orange">{btn_text}</button>
					</div>'''

    new_text = pattern.sub(repl, text)
    if new_text != text:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_text)
        print(f'Updated {filepath}')
    else:
        print(f'Pattern did not match in {filepath}')

update_form_footer('index.html')
update_form_footer('teachers.html')
