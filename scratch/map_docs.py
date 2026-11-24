import os, re

files = [f for f in os.listdir('documents') if os.path.isfile(os.path.join('documents', f))]
files.sort()

# Маппинг транслитерации для файлов документов
mapping = {
    "2024-2025-Положение-оценки-1-4 классы.pdf": "polozhenie-otsenki-1-4-klassy-2024-2025.pdf",
    "2024-2025-Правила поведения учащихся 25-ред (1).pdf": "pravila-povedeniya-uchaschihsya-2024-2025.pdf",
    "2024-2025_Порядок_оказания_учебно_методической_помощи_при_дистанте.pdf": "poryadok-pomoschi-pri-distante-2024-2025.pdf",
    "20240401 Конфессионал представление с оборотом.pdf": "konfessionalnoe-predstavlenie-2024.pdf",
    "2025-2026-Положение о постановке учащихся и семей на внутришкольный учет.pdf": "polozhenie-vnutrishkolnyy-uchet-2025-2026.pdf",
    "20250217-Выписка из реестра лицензий № Л035-01297-33-00233807.pdf": "vypiska-reestr-litsenziy-l035-01297-33-00233807.pdf",
    "Выписка из государственной информационной системы об аккредитации.pdf": "vypiska-gis-akkreditatsiya.pdf",
    "График оценочных процедур 2026-2027 обл.pdf": "grafik-otsenochnyh-protsedur-2026-2027.pdf",
    "Договор с провайдером.pdf": "dogovor-s-provayderom.pdf",
    "Кодекс (Правила) гимназической жизни 24.pdf": "kodeks-gimnazicheskoy-zhizni-2024.pdf",
    "Кодекс профессиональной этики педагога 25.pdf": "kodeks-etiki-pedagoga-2025.pdf",
    "Отчет-ФХД-2025.pdf": "otchet-fhd-2025.pdf",
    "ПОЛОЖЕНИЕ о летней практике.pdf": "polozhenie-letnyaya-praktika.pdf",
    "Положение Об использовании учащимися мобильных телефонов.pdf": "polozhenie-mobilnye-telefony.pdf",
    "Положение о  педагогическом совете гимназии.pdf": "polozhenie-pedagogicheskiy-sovet.pdf",
    "Положение о ведении классных журналов 25.pdf": "polozhenie-klassnye-zhurnaly-2025.pdf",
    "Положение о ведении электронного журнала.pdf": "polozhenie-elektronnyy-zhurnal.pdf",
    "Положение о дистанционном обучении.pdf": "polozhenie-distantsionnoe-obuchenie.pdf",
    "Положение о комиссии по урегулированию споров между участниками образовательных отношений.pdf": "polozhenie-komissiya-spory.pdf",
    "Положение о методическом объединении учителей-предметников.pdf": "polozhenie-metodicheskoe-obedinenie.pdf",
    "Положение о переводе-2023.pdf": "polozhenie-o-perevode-2023.pdf",
    "Положение о поощрении учащихся 25.pdf": "polozhenie-pooschrenie-uchaschihsya-2025.pdf",
    "Положение о порядке посещения мероприятий 25.pdf": "polozhenie-poseschenie-meropriyatiy-2025.pdf",
    "Положение о порядке привлечения и исп-я благотв средств.pdf": "polozhenie-blagotvoritelnye-sredstva.pdf",
    "Положение о порядке распределения стимулирующей части фонда оплаты труда.pdf": "polozhenie-stimuliruyuschiy-fond-oplaty-truda.pdf",
    "Положение о порядке текущего контроля и промежуточной аттестации 2026.pdf": "polozhenie-tekuschiy-kontrol-attestatsiya-2026.pdf",
    "Положение о правилах внутреннего распорядка 25.pdf": "polozhenie-pravila-vnutrennego-rasporyadka-2025.pdf",
    "Положение о родительском комитете 25.pdf": "polozhenie-roditelskiy-komitet-2025.pdf",
    "Положение о самообследовании.pdf": "polozhenie-samoobsledovanie.pdf",
    "Положение о системе поощрения педагогов+.pdf": "polozhenie-pooschrenie-pedagogov.pdf",
    "Положение о формах получения образования.pdf": "polozhenie-formy-obrazovaniya.pdf",
    "Положение о школьной форме и внешнем виде  25.pdf": "polozhenie-shkolnaya-forma-2025.pdf",
    "Положение о языке образования.pdf": "polozhenie-yazyk-obrazovaniya.pdf",
    "Положение об ЭИОС 2026 подп.pdf": "polozhenie-eios-2026.pdf",
    "Положение об ЭИОС.pdf": "polozhenie-eios-arhiv.pdf",
    "Положение об инд учете рез-тов освоения обучающимися образоват программ.pdf": "polozhenie-ind-uchet-rezultatov-arhiv.pdf",
    "Положение об индивидуальном учете результатов освоения программ 25.pdf": "polozhenie-ind-uchet-rezultatov-2025.pdf",
    "Положение об организации обучения на дому 25.pdf": "polozhenie-obuchenie-na-domu-2025.pdf",
    "Положение об официальном сайте Православной гимназии.pdf": "polozhenie-ofitsialnyy-sayt.pdf",
    "Положение об учебно-воспитательной комиссии 25.pdf": "polozhenie-uchebno-vospitatelnaya-komissiya-2025.pdf",
    "Положение об ученическом совете 25.pdf": "polozhenie-uchenicheskiy-sovet-2025.pdf",
    "Порядок доступа педагогических работников 25.pdf": "poryadok-dostupa-pedagogov-2025.pdf",
    "Порядок оформления возникновения отношений.pdf": "poryadok-oformleniya-otnosheniy.pdf",
    "Порядок формирования аттестац. комиссии 2023.pdf": "poryadok-attestatsionnaya-komissiya-2023.pdf",
    "Правила внутреннего трудового распорядка гимназии.pdf": "pravila-trudovogo-rasporyadka.pdf",
    "Правила приема на обучение в гимназию.pdf": "pravila-priema-v-gimnaziyu.pdf",
    "Публичная оферта о заключении договора добровольного пожертвования.pdf": "publichnaya-oferta-pozhertvovaniya.pdf",
    "Режим занятий обучающихся 25.pdf": "rezhim-zanyatiy-2025.pdf",
    "Сведения о педагогах.pdf": "svedeniya-o-pedagogah.pdf",
    "Свод правил для родителей учащихся 25.pdf": "svod-pravil-dlya-roditeley-2025.pdf",
    "УСТАВ гимназии.pdf": "ustav-gimnazii.pdf",
    "коллективный договор 22-25.pdf": "kollektivnyy-dogovor-2022-2025.pdf",
    "положение о воспитательной работе 25.pdf": "polozhenie-vospitatelnaya-rabota-2025.pdf",
    "положение о пользовании учебниками 25.pdf": "polozhenie-polzovanie-uchebnikami-2025.pdf",
    "положение о системе внутреннего мониторинга качества образования 25.pdf": "polozhenie-monitoring-kachestva-obrazovaniya-2025.pdf",
}

# Дубликаты на удаление:
duplicates_to_delete = [
    "2024-2025-Положение-оценки-1-4 классы (1).pdf",
    "2025-2026-Положение о постановке учащихся и семей на внутришкольный учет (1).pdf",
    "2025-2026-Положение о постановке учащихся и семей на внутришкольный учет (2).pdf",
    "Положение о правилах внутреннего распорядка 25 (1).pdf",
]

print("Mapped files:", len(mapping))
unmapped = [f for f in files if f not in mapping and f not in duplicates_to_delete and not f.endswith('.pdf') or (f.endswith('.pdf') and f not in mapping and f not in duplicates_to_delete)]
print("Unmapped:", unmapped)
