import re

path = 'sveden/paid_edu.html'
with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the whole section from <section class="sveden-section"> containing "Платные образовательные услуги" to </section>
start_str = '<section class="sveden-section">\n\t\t\t\t\t\t<h3 class="sveden-section__title">Платные образовательные услуги</h3>'
if start_str not in html:
    # try normalized
    start_pos = html.find('Платные образовательные услуги</h3>')
    section_start = html.rfind('<section class="sveden-section">', 0, start_pos)
    section_end = html.find('</section>', start_pos) + len('</section>')
    old_section = html[section_start:section_end]
else:
    section_start = html.find(start_str)
    section_end = html.find('</section>', section_start) + len('</section>')
    old_section = html[section_start:section_end]

new_section = '''<section class="sveden-section">
						<div class="sveden-info-card" style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:18px 20px; margin-bottom:24px;">
							<div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
									<polyline points="22 4 12 14.01 9 11.01"></polyline>
								</svg>
								<strong style="color:#15803d; font-size:16px;">ЧОУ «Православная гимназия г. Коврова» платные образовательные услуги не оказывает</strong>
							</div>
							<p style="margin:0; font-size:14px; line-height:1.6; color:#166534;">
								Обучение по всем реализуемым программам начального общего, основного общего и среднего общего образования осуществляется на безвозмездной основе за счет субсидий бюджета Владимирской области и средств учредителя.
							</p>
						</div>

						<h3 class="sveden-section__title">Сведения об оказании платных образовательных услуг</h3>
						<div class="sveden-table-wrap">
							<table class="sveden-table">
								<tr>
									<th class="row-header">Порядок оказания платных образовательных услуг</th>
									<td>
										<div itemprop="paidEduDoc">
											Платные образовательные услуги гимназией <strong>не оказываются</strong>. Положение об оказании платных образовательных услуг не разрабатывалось в связи с отсутствием платной деятельности.
										</div>
									</td>
								</tr>
								<tr>
									<th class="row-header">Образец договора об оказании платных образовательных услуг</th>
									<td>
										<div itemprop="paidEduContract">
											Договоры об оказании платных образовательных услуг <strong>не заключаются</strong>.
										</div>
									</td>
								</tr>
								<tr>
									<th class="row-header">Документ об утверждении стоимости обучения</th>
									<td>
										<div itemprop="paidEduCost">
											Обучение является <strong>бесплатным</strong>. Документ об утверждении стоимости обучения по каждой образовательной программе отсутствует.
										</div>
									</td>
								</tr>
								<tr>
									<th class="row-header">Размер платы за присмотр и уход в группах продленного дня</th>
									<td>
										<div itemprop="paidEdu">
											Плата за присмотр и уход за детьми, осваивающими образовательные программы в группах продленного дня, <strong>не взимается</strong>.
										</div>
									</td>
								</tr>
							</table>
						</div>
					</section>'''

html = html[:section_start] + new_section + html[section_end:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(html)
print('Successfully replaced paid_edu.html section!')
