import os, re

# ==============================================================================
# 1. SVEDEN/VACANT.HTML
# ==============================================================================
def update_vacant():
    path = 'sveden/vacant.html'
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Old table + placeholder pattern
    old_section_pattern = re.compile(
        r'<div class="sveden-content__header">.*?<h2 class="sveden-content__title">Вакантные места для приема.*?</div>\s*<section class="sveden-section">.*?</table>\s*</div>\s*<div class="sveden-placeholder">.*?</div>\s*</section>',
        re.DOTALL
    )

    new_section = '''<div class="sveden-content__header">
						<h2 class="sveden-content__title">Вакантные места для приема (перевода) обучающихся</h2>
						<p class="sveden-content__lead">Количество вакантных мест для приема и перевода обучающихся по классам на 2026–2027 учебный год.</p>
					</div>

					<section class="sveden-section">
						<div class="sveden-info-card" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:16px 20px; margin-bottom:20px;">
							<p style="margin:0; font-size:15px; line-height:1.6; color:#334155;">
								В связи со спецификой образовательной организации приём на обучение в ЧОУ «Православная гимназия г. Коврова» происходит по итогам индивидуального собеседования с директором и представителями администрации. Максимальная наполняемость каждого класса — <strong>20 человек</strong>.
							</p>
						</div>

						<h3 class="sveden-section__title">Количество вакантных мест для приема (перевода) обучающихся</h3>
						<div class="sveden-table-wrap">
							<table class="sveden-table">
								<thead>
									<tr>
										<th>Класс / Уровень образования</th>
										<th>За счет бюджетных ассигнований федерального бюджета</th>
										<th>За счет бюджетов субъектов РФ / местных бюджетов</th>
										<th>По договорам об образовании (за счет физ. / юр. лиц)</th>
									</tr>
								</thead>
								<tbody>
									<tr itemprop="vacant">
										<td><strong>1 класс</strong> (набрано 17 из 20 возможных)</td>
										<td>0</td>
										<td><strong>3</strong> вакантных места</td>
										<td>0 (обучение бесплатное)</td>
									</tr>
									<tr itemprop="vacant">
										<td><strong>2 класс</strong></td>
										<td>0</td>
										<td><strong>1</strong> вакантное место</td>
										<td>0</td>
									</tr>
									<tr itemprop="vacant">
										<td><strong>3 класс</strong></td>
										<td>0</td>
										<td><strong>4</strong> вакантных места</td>
										<td>0</td>
									</tr>
									<tr itemprop="vacant">
										<td><strong>4 класс</strong></td>
										<td>0</td>
										<td><strong>0</strong> (мест нет)</td>
										<td>0</td>
									</tr>
									<tr itemprop="vacant">
										<td><strong>5 класс</strong></td>
										<td>0</td>
										<td><strong>2</strong> вакантных места</td>
										<td>0</td>
									</tr>
									<tr itemprop="vacant">
										<td><strong>6 класс</strong></td>
										<td>0</td>
										<td><strong>0</strong> (мест нет)</td>
										<td>0</td>
									</tr>
									<tr itemprop="vacant">
										<td><strong>7 класс</strong></td>
										<td>0</td>
										<td><strong>7</strong> вакантных мест</td>
										<td>0</td>
									</tr>
									<tr itemprop="vacant">
										<td><strong>8 класс</strong></td>
										<td>0</td>
										<td><strong>8</strong> вакантных мест</td>
										<td>0</td>
									</tr>
									<tr itemprop="vacant">
										<td><strong>9 класс</strong></td>
										<td>0</td>
										<td><strong>12</strong> вакантных мест</td>
										<td>0</td>
									</tr>
									<tr itemprop="vacant">
										<td><strong>10 класс</strong></td>
										<td>0</td>
										<td><strong>13</strong> вакантных мест</td>
										<td>0</td>
									</tr>
									<tr itemprop="vacant">
										<td><strong>11 класс</strong></td>
										<td>0</td>
										<td><strong>13</strong> вакантных мест</td>
										<td>0</td>
									</tr>
								</tbody>
							</table>
						</div>
					</section>

					<section class="sveden-section">
						<h3 class="sveden-section__title">Бланки и документы для приема</h3>
						<div style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">
							<div class="sveden-doc-item">
								<div class="sveden-doc-info">
									<svg class="sveden-doc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
										stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22"
										height="22">
										<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
										<polyline points="14 2 14 8 20 8"></polyline>
										<line x1="16" y1="13" x2="8" y2="13"></line>
										<line x1="16" y1="17" x2="8" y2="17"></line>
									</svg>
									<div>
										<a href="../documents/zayavlenie_v_1klass.pdf" target="_blank"
											class="sveden-doc-title"><strong>Бланк заявления о приеме в 1-й класс</strong></a>
										<div class="sveden-doc-meta">Электронный документ в формате PDF</div>
									</div>
								</div>
								<div class="sveden-doc-actions">
									<span class="sveden-badge-sign">ЭЦП</span>
									<a href="../documents/zayavlenie_v_1klass.pdf" download class="sveden-badge-sign"
										style="background:#e0f2fe; border-color:#7dd3fc; color:#0369a1; text-decoration:none;">Скачать</a>
								</div>
							</div>
							<div class="sveden-doc-item">
								<div class="sveden-doc-info">
									<svg class="sveden-doc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
										stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22"
										height="22">
										<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
										<polyline points="14 2 14 8 20 8"></polyline>
										<line x1="16" y1="13" x2="8" y2="13"></line>
										<line x1="16" y1="17" x2="8" y2="17"></line>
									</svg>
									<div>
										<a href="../documents/%D0%9F%D1%80%D0%B0%D0%B2%D0%B8%D0%BB%D0%B0%20%D0%BF%D1%80%D0%B8%D0%B5%D0%BC%D0%B0%20%D0%BD%D0%B0%20%D0%BE%D0%B1%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%B2%20%D0%B3%D0%B8%D0%BC%D0%BD%D0%B0%D0%B7%D0%B8%D1%8E.pdf" target="_blank"
											class="sveden-doc-title"><strong>Правила приема на обучение в гимназию</strong></a>
										<div class="sveden-doc-meta">Электронный документ в формате PDF</div>
									</div>
								</div>
								<div class="sveden-doc-actions">
									<span class="sveden-badge-sign">ЭЦП</span>
									<a href="../documents/%D0%9F%D1%80%D0%B0%D0%B2%D0%B8%D0%BB%D0%B0%20%D0%BF%D1%80%D0%B8%D0%B5%D0%BC%D0%B0%20%D0%BD%D0%B0%20%D0%BE%D0%B1%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%B2%20%D0%B3%D0%B8%D0%BC%D0%BD%D0%B0%D0%B7%D0%B8%D1%8E.pdf" download class="sveden-badge-sign"
										style="background:#e0f2fe; border-color:#7dd3fc; color:#0369a1; text-decoration:none;">Скачать</a>
								</div>
							</div>
						</div>
					</section>'''

    if old_section_pattern.search(html):
        html = old_section_pattern.sub(new_section, html)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print('Updated vacant.html successfully!')
    else:
        print('Pattern not matched in vacant.html')


# ==============================================================================
# 2. SVEDEN/PAID_EDU.HTML
# ==============================================================================
def update_paid_edu():
    path = 'sveden/paid_edu.html'
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    old_section_pattern = re.compile(
        r'<section class="sveden-section">\s*<h3 class="sveden-section__title">Платные образовательные услуги</h3>.*?</table>\s*</div>\s*</section>',
        re.DOTALL
    )

    new_section = '''<section class="sveden-section">
						<div class="sveden-info-card" style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:16px 20px; margin-bottom:20px;">
							<div style="display:flex; align-items:center; gap:10px;">
								<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
									<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
									<polyline points="22 4 12 14.01 9 11.01"></polyline>
								</svg>
								<strong style="color:#15803d; font-size:16px;">ЧОУ «Православная гимназия г. Коврова» платные образовательные услуги не оказывает</strong>
							</div>
							<p style="margin:8px 0 0; font-size:14px; line-height:1.5; color:#166534;">
								Обучение по всем реализуемым программам общего образования осуществляется на безвозмездной основе за счет субсидий бюджета Владимирской области и средств учредителя.
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

    if old_section_pattern.search(html):
        html = old_section_pattern.sub(new_section, html)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print('Updated paid_edu.html successfully!')
    else:
        print('Pattern not matched in paid_edu.html')


# ==============================================================================
# 3. SVEDEN/BUDGET.HTML
# ==============================================================================
def update_budget():
    path = 'sveden/budget.html'
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    old_section_pattern = re.compile(
        r'<section class="sveden-section">\s*<h3 class="sveden-section__title">Финансово-хозяйственная деятельность</h3>.*?</table>\s*</div>\s*</section>',
        re.DOTALL
    )

    new_section = '''<section class="sveden-section">
						<h3 class="sveden-section__title">Финансово-хозяйственная деятельность</h3>
						<div class="sveden-table-wrap">
							<table class="sveden-table">
								<tr>
									<th class="row-header">План финансово-хозяйственной деятельности</th>
									<td>
										<div itemprop="finPlanDoc">
											<div class="sveden-doc-item" style="border:none; padding:4px 0;">
												<div class="sveden-doc-info">
													<svg class="sveden-doc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
														stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
														<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
														<polyline points="14 2 14 8 20 8"></polyline>
														<line x1="16" y1="13" x2="8" y2="13"></line>
														<line x1="16" y1="17" x2="8" y2="17"></line>
													</svg>
													<div>
														<a href="../documents/Отчет-ФХД-2025.pdf" target="_blank" class="sveden-doc-title">
															<strong>Отчет об исполнении плана финансово-хозяйственной деятельности ЧОУ «Православная гимназия г. Коврова»</strong>
														</a>
														<div class="sveden-doc-meta">Электронный документ в формате PDF (1.98 МБ)</div>
													</div>
												</div>
												<div class="sveden-doc-actions">
													<span class="sveden-badge-sign">ЭЦП</span>
													<a href="../documents/Отчет-ФХД-2025.pdf" download class="sveden-badge-sign"
														style="background:#e0f2fe; border-color:#7dd3fc; color:#0369a1; text-decoration:none;">Скачать</a>
												</div>
											</div>
										</div>
									</td>
								</tr>
								<tr>
									<th class="row-header">Объем образовательной деятельности за счет бюджетов различных уровней</th>
									<td>
										<div itemprop="volumeFin">
											Финансовое обеспечение осуществляется за счет субсидий из областного бюджета Владимирской области на реализацию основных общеобразовательных программ в соответствии с установленными нормативами.
										</div>
									</td>
								</tr>
								<tr>
									<th class="row-header">Объем образовательной деятельности по договорам об образовании</th>
									<td>
										<div itemprop="volumeFin">
											<strong>0 рублей</strong> (платные образовательные услуги гимназией не оказываются, финансовые средства по договорам об образовании от физ./юр. лиц не поступают).
										</div>
									</td>
								</tr>
								<tr>
									<th class="row-header">Поступление и расходование финансовых и материальных средств</th>
									<td>
										<div itemprop="finReportDoc">
											Поступление и расходование финансовых и материальных средств отражено в официальном ежегодном отчете ФХД гимназии.
											<div style="margin-top:8px;">
												<a href="../documents/Отчет-ФХД-2025.pdf" target="_blank" style="color:#0369a1; font-weight:600; text-decoration:underline;">
													Ознакомиться с отчетом о расходовании средств (PDF)
												</a>
											</div>
										</div>
									</td>
								</tr>
							</table>
						</div>
					</section>'''

    if old_section_pattern.search(html):
        html = old_section_pattern.sub(new_section, html)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print('Updated budget.html successfully!')
    else:
        print('Pattern not matched in budget.html')


# ==============================================================================
# 4. SVEDEN/EDUCATION.HTML
# ==============================================================================
def update_education():
    path = 'sveden/education.html'
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Update number of students
    old_students_pattern = re.compile(
        r'<div itemprop="numberStudents">.*?</div>',
        re.DOTALL
    )
    new_students = '''<div itemprop="numberStudents"><strong>157 учащихся</strong> (по состоянию на 01.09.2026 г.):<ul>
												<li>Начальное общее образование (ООП НОО, 1–4 классы) — <strong>72</strong> учащихся</li>
												<li>Основное общее образование (ООП ООО, 5–9 классы) — <strong>71</strong> учащийся</li>
												<li>Среднее общее образование (ООП СОО, 10–11 классы) — <strong>14</strong> учащихся</li>
											</ul>
										</div>'''

    if old_students_pattern.search(html):
        html = old_students_pattern.sub(new_students, html)

    # Replace calendar schedule placeholder
    old_cal_pattern = re.compile(
        r'<div itemprop="calendarSchedule">\s*<div class="sveden-placeholder">.*?</div>\s*</div>',
        re.DOTALL
    )
    new_cal = '''<div itemprop="calendarSchedule">
											<p style="margin:0 0 8px;">Календарный учебный график регламентирует продолжительность учебного года, четвертей и каникул:</p>
											<ul style="margin:0 0 10px 20px;">
												<li>Начало учебного года: 1 сентября</li>
												<li>Режим недели: 5-дневная (1–4 классы), 6-дневная (5–11 классы)</li>
												<li>Сменность: обучение в одну смену с 08:00 до 16:00</li>
											</ul>
											<a href="../documents/%D0%A0%D0%B5%D0%B6%D0%B8%D0%BC%20%D0%B7%D0%B0%D0%BD%D1%8F%D1%82%D0%B8%D0%B9%20%D0%BE%D0%B1%D1%83%D1%87%D0%B0%D1%8E%D1%89%D0%B8%D1%85%D1%81%D1%8F%2025.pdf" target="_blank" style="color:#0284c7; font-weight:600; text-decoration:underline;">
												Режим занятий обучающихся (PDF)
											</a>
										</div>'''

    if old_cal_pattern.search(html):
        html = old_cal_pattern.sub(new_cal, html)

    # Replace eduPlan placeholders
    edu_plan_replacement = '''<div itemprop="eduPlan">
												<span style="font-size:14px; color:#475569;">Реализуется в соответствии с ФГОС и утвержденной ООП. Ознакомиться с документами:</span>
												<div style="margin-top:6px; display:flex; flex-direction:column; gap:4px;">
													<a href="../documents/%D0%9F%D0%BE%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BE%20%D1%8F%D0%B7%D1%8B%D0%BA%D0%B5%20%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F.pdf" target="_blank" style="font-size:13px; color:#0284c7; text-decoration:underline;">Положение о языке образования (PDF)</a>
													<a href="../documents/%D0%9F%D0%BE%D0%BB%D0%BE%D0%B6%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BE%20%D1%84%D0%BE%D1%80%D0%BC%D0%B0%D1%85%20%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D1%8F%20%D0%BE%D0%B1%D1%80%D0%B0%D0%B7%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F.pdf" target="_blank" style="font-size:13px; color:#0284c7; text-decoration:underline;">Положение о формах получения образования (PDF)</a>
												</div>
											</div>'''

    html = re.sub(r'<div itemprop="eduPlan">\s*<div class="sveden-placeholder">.*?</div>\s*</div>', edu_plan_replacement, html, flags=re.DOTALL)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print('Updated education.html successfully!')


# ==============================================================================
# 5. SVEDEN/GRANTS.HTML
# ==============================================================================
def update_grants():
    path = 'sveden/grants.html'
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    old_section_pattern = re.compile(
        r'<section class="sveden-section">\s*<h3 class="sveden-section__title">Стипендии и меры поддержки обучающихся</h3>.*?</table>\s*</div>\s*</section>',
        re.DOTALL
    )

    new_section = '''<section class="sveden-section">
						<h3 class="sveden-section__title">Стипендии и меры поддержки обучающихся</h3>
						<div class="sveden-table-wrap">
							<table class="sveden-table">
								<tr>
									<th class="row-header">Стипендии обучающимся</th>
									<td>
										<div itemprop="grant">Выплата стипендий обучающимся <strong>не предусмотрена</strong>.</div>
									</td>
								</tr>
								<tr>
									<th class="row-header">Меры социальной поддержки</th>
									<td>
										<div itemprop="support">Обучающимся гимназии предоставляются меры социальной поддержки в соответствии с действующим законодательством Владимирской области (в том числе организация бесплатного горячего питания для учащихся начальных классов, а также льготного питания для детей из многодетных семей и семей участников СВО).</div>
									</td>
								</tr>
								<tr>
									<th class="row-header">Наличие общежития, интерната</th>
									<td>
										<div itemprop="hostel">Общежитие и интернат <strong>отсутствуют</strong>. Жилые помещения обучающимся не предоставляются.</div>
									</td>
								</tr>
								<tr>
									<th class="row-header">Плата за проживание в общежитии</th>
									<td>
										<div itemprop="hostelFee">В связи с отсутствием общежития и интерната плата за проживание <strong>не взимается</strong>.</div>
									</td>
								</tr>
							</table>
						</div>
					</section>'''

    if old_section_pattern.search(html):
        html = old_section_pattern.sub(new_section, html)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print('Updated grants.html successfully!')
    else:
        print('Pattern not matched in grants.html')


# ==============================================================================
# 6. SVEDEN/EDUSTANDARTS.HTML
# ==============================================================================
def update_edu_standarts():
    path = 'sveden/eduStandarts.html'
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Remove the placeholder at the bottom
    old_placeholder = re.compile(
        r'<div class="sveden-placeholder">\s*<svg class="sveden-placeholder__icon".*?</div>',
        re.DOTALL
    )
    if old_placeholder.search(html):
        html = old_placeholder.sub('', html)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(html)
        print('Updated eduStandarts.html successfully!')
    else:
        print('Placeholder not matched in eduStandarts.html')

update_vacant()
update_paid_edu()
update_budget()
update_education()
update_grants()
update_edu_standarts()
