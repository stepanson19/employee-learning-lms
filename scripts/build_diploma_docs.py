from __future__ import annotations

import math
import textwrap
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

from docx import Document
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Mm, Pt, RGBColor
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "diploma" / "generated"
DIAGRAM_DIR = OUT_DIR / "diagrams"
SCREENSHOT_DIR = OUT_DIR / "screenshots"

COMMON_OBJECT = (
    "существующие и проектируемые информационные системы дистанционного корпоративного обучения, "
    "используемые для организации учебного контента, контроля прогресса сотрудников и поддержки "
    "управленческих решений в сфере развития персонала"
)

TECH_STACK = (
    "Next.js App Router, React, TypeScript, серверные маршруты API, локальное JSON-хранилище, "
    "резервное хранение в localStorage, возможность подключения PostgreSQL через DATABASE_URL, "
    "Vitest и Playwright для автоматизированного тестирования"
)

MODULES = [
    {
        "num": 1,
        "key": "content",
        "file": "01_Модуль_управления_контентом_CMS.docx",
        "title": "Модуль управления контентом (CMS)",
        "topic": "Разработка модуля управления учебным контентом платформы удаленного обучения сотрудников предприятий с элементами геймификации",
        "goal": "спроектировать и реализовать модуль управления учебным контентом LMS, обеспечивающий создание курсов, уроков, тестовых блоков, фильтрацию каталога и контроль статусов публикации",
        "subject": "процесс создания, структурирования, публикации и поиска учебных материалов в корпоративной LMS",
        "module_result": "работоспособный CMS-модуль с каталогом курсов, формой создания черновика, уроками, тестовыми вопросами, статусами публикации и поиском",
        "actors": ["Автор курса", "HR-специалист", "Сотрудник"],
        "entities": ["Course", "Lesson", "QuizQuestion", "User", "ProgressRecord"],
        "page": "/courses",
        "screenshot": "01_content_cms.png",
        "hours": 184,
        "focus_file": "src/app/courses/page.tsx",
        "tasks": [
            "исследовать процессы управления учебным контентом и публикации материалов",
            "сформировать требования к карточке курса, урокам, тестам и статусам",
            "спроектировать структуру данных для курсов, уроков и вопросов тестирования",
            "реализовать каталог, фильтры, поиск и создание черновика курса",
            "проверить сценарии автора и HR-специалиста автоматизированными тестами",
        ],
        "requirements": [
            ("CMS-F1", "автор создает черновик курса с названием, описанием, категорией, сроком, XP и уроками"),
            ("CMS-F2", "пользователь фильтрует каталог по категории и статусу публикации"),
            ("CMS-F3", "поиск находит курс по названию, описанию, категории и уровню сложности"),
            ("CMS-F4", "карточка курса показывает уроки, длительность, XP, дедлайн и текущий статус"),
            ("CMS-F5", "автор добавляет проверочные вопросы к тестовому уроку"),
        ],
        "tests": [
            ("Создание курса", "автор заполняет форму и нажимает «создать курс»", "в каталоге появляется новый черновик"),
            ("Фильтрация", "пользователь выбирает категорию или статус", "список показывает только подходящие курсы"),
            ("Поиск", "в поле поиска введено слово «безопасность»", "отображается курс «Информационная безопасность»"),
            ("Тестовый вопрос", "автор добавляет вопрос на странице курса", "вопрос появляется в блоке тестирования"),
        ],
    },
    {
        "num": 2,
        "key": "gamification",
        "file": "02_Модуль_геймификации.docx",
        "title": "Модуль геймификации",
        "topic": "Разработка модуля геймификации платформы удаленного обучения сотрудников предприятий",
        "goal": "спроектировать и реализовать модуль геймификации LMS, включающий начисление XP, уровни, бейджи, рейтинги и магазин поощрений",
        "subject": "процесс мотивации сотрудников к прохождению корпоративного обучения с использованием игровых механик",
        "module_result": "модуль XP, уровней, бейджей, рейтингов сотрудников и отделов, журнала операций и заявок на поощрения",
        "actors": ["Сотрудник", "HR-специалист", "Система LMS"],
        "entities": ["User", "Badge", "XpTransaction", "RewardItem", "RewardRedemption", "ProgressRecord"],
        "page": "/achievements",
        "screenshot": "02_gamification.png",
        "hours": 176,
        "focus_file": "src/app/achievements/page.tsx",
        "tasks": [
            "проанализировать игровые механики, применимые в корпоративном обучении",
            "определить правила начисления XP, уровней и бейджей",
            "спроектировать рейтинги сотрудников и отделов",
            "реализовать магазин поощрений и журнал операций с XP",
            "протестировать начисления, списания и отображение достижений",
        ],
        "requirements": [
            ("GAM-F1", "система начисляет XP за успешное завершение курса"),
            ("GAM-F2", "уровень сотрудника рассчитывается по накопленным XP"),
            ("GAM-F3", "бейджи выдаются по правилам: первый курс, высокий балл, недельная активность"),
            ("GAM-F4", "рейтинги сотрудников и отделов сортируются по XP"),
            ("GAM-F5", "пользователь обменивает XP на заявку в магазине поощрений"),
        ],
        "tests": [
            ("Начисление XP", "сотрудник завершает курс", "баланс XP и журнал операций обновляются"),
            ("Получение бейджа", "условие правила выполнено", "бейдж отображается в профиле и на странице достижений"),
            ("Рейтинг", "открыта страница достижений", "сотрудники отсортированы по убыванию XP"),
            ("Магазин", "сотрудник с достаточным балансом нажимает «обменять»", "создается заявка на поощрение"),
        ],
    },
    {
        "num": 3,
        "key": "profile",
        "file": "03_Личный_кабинет_сотрудника.docx",
        "title": "Личный кабинет сотрудника",
        "topic": "Разработка личного кабинета сотрудника в платформе удаленного корпоративного обучения",
        "goal": "спроектировать и реализовать личный кабинет сотрудника, отображающий профиль, учебный план, дедлайны, прогресс, историю обучения, уведомления и награды",
        "subject": "процесс сопровождения индивидуального учебного плана сотрудника в корпоративной LMS",
        "module_result": "личный кабинет с профилем, дорожной картой обучения, ближайшим курсом, историей прогресса, уведомлениями и наградами",
        "actors": ["Сотрудник", "HR-специалист", "Система LMS"],
        "entities": ["User", "CourseAssignment", "Course", "ProgressRecord", "XpTransaction", "Badge"],
        "page": "/profile",
        "screenshot": "03_employee_profile.png",
        "hours": 168,
        "focus_file": "src/app/profile/page.tsx",
        "tasks": [
            "изучить сценарии сотрудника при прохождении назначенного обучения",
            "определить состав данных профиля, плана развития и уведомлений",
            "спроектировать учебную дорожную карту и блок следующего действия",
            "реализовать историю обучения, прогресс, XP и награды в одном интерфейсе",
            "проверить переходы из кабинета на страницы курсов",
        ],
        "requirements": [
            ("CAB-F1", "сотрудник видит свой профиль, должность, отдел и навыки"),
            ("CAB-F2", "учебный план показывает назначенные курсы, сроки, статус и прогресс"),
            ("CAB-F3", "система выделяет ближайший следующий шаг и дедлайн"),
            ("CAB-F4", "кабинет показывает историю обучения и журнал XP"),
            ("CAB-F5", "уведомления информируют о назначениях, дедлайнах и достижениях"),
        ],
        "tests": [
            ("Открытие кабинета", "сотрудник входит в систему и открывает /profile", "отображается профиль и дорожная карта"),
            ("Следующий шаг", "есть активные назначения", "ближайший курс доступен по кнопке «открыть курс»"),
            ("История обучения", "у сотрудника есть ProgressRecord", "таблица показывает курс, прогресс, балл и статус"),
            ("Уведомления", "назначен новый курс", "уведомление появляется в профиле"),
        ],
    },
    {
        "num": 4,
        "key": "analytics",
        "file": "04_Модуль_аналитики_и_отчетности.docx",
        "title": "Модуль аналитики и отчетности",
        "topic": "Разработка модуля аналитики и отчетности для HR и руководителя в платформе удаленного обучения",
        "goal": "спроектировать и реализовать аналитический модуль LMS, позволяющий HR контролировать прогресс сотрудников, средний балл, сроки прохождения, вовлеченность и выгрузку отчета",
        "subject": "процесс сбора, расчета и визуального представления показателей корпоративного обучения для HR и руководителей",
        "module_result": "дашборд HR с метриками, фильтрами по отделу и курсу, зоной внимания, эффективностью курсов, таблицами и CSV-выгрузкой",
        "actors": ["HR-специалист", "Руководитель", "Система LMS"],
        "entities": ["User", "Course", "ProgressRecord", "CourseAssignment", "AnalyticsRow"],
        "page": "/analytics",
        "screenshot": "04_analytics.png",
        "hours": 188,
        "focus_file": "src/app/analytics/page.tsx",
        "tasks": [
            "определить ключевые показатели эффективности корпоративного обучения",
            "спроектировать алгоритмы расчета завершения, среднего балла, времени и вовлеченности",
            "реализовать фильтрацию отчета по отделам и курсам",
            "выделить зону внимания по просрочкам и низкому прогрессу",
            "подготовить CSV-выгрузку и тесты расчетов",
        ],
        "requirements": [
            ("AN-F1", "дашборд показывает процент завершения, средний балл, активных учеников и время обучения"),
            ("AN-F2", "HR фильтрует отчет по отделу и конкретному курсу"),
            ("AN-F3", "система выделяет просрочки и низкий прогресс в зоне внимания"),
            ("AN-F4", "таблица сотрудников показывает статус обучения по выбранному сегменту"),
            ("AN-F5", "отчет можно выгрузить в CSV для последующей обработки"),
        ],
        "tests": [
            ("Доступ HR", "HR открывает /analytics", "дашборд доступен и содержит показатели"),
            ("Ограничение доступа", "сотрудник открывает /analytics", "показывается сообщение о запрете"),
            ("Фильтр отдела", "выбран отдел «Поддержка»", "таблица содержит сотрудников этого отдела"),
            ("CSV", "нажата ссылка выгрузки", "формируется CSV с сотрудником, курсом, прогрессом и статусом"),
        ],
    },
    {
        "num": 5,
        "key": "feedback",
        "file": "05_Модуль_коммуникаций_и_обратной_связи.docx",
        "title": "Модуль коммуникаций и обратной связи",
        "topic": "Разработка модуля коммуникаций и обратной связи в платформе удаленного корпоративного обучения",
        "goal": "спроектировать и реализовать модуль обсуждений и обратной связи, обеспечивающий комментарии по курсам, оценку качества обучения и переход к связанным учебным материалам",
        "subject": "процесс обмена сообщениями, сбора отзывов и анализа удовлетворенности сотрудников обучением",
        "module_result": "страница обсуждений курсов, форма оценки, список отзывов, средняя удовлетворенность и переходы из названий курсов к их карточкам",
        "actors": ["Сотрудник", "HR-специалист", "Автор курса"],
        "entities": ["DiscussionMessage", "Feedback", "Course", "User"],
        "page": "/feedback",
        "screenshot": "05_feedback.png",
        "hours": 164,
        "focus_file": "src/app/feedback/page.tsx",
        "tasks": [
            "исследовать роль коммуникаций и фидбека в улучшении учебных материалов",
            "спроектировать структуру обсуждений и отзывов по курсам",
            "реализовать форму оценки качества курса",
            "обеспечить переход из названий курсов к соответствующим страницам",
            "протестировать сохранение обратной связи и навигацию для HR/автора",
        ],
        "requirements": [
            ("COM-F1", "пользователь видит обсуждения курсов с автором сообщения и датой"),
            ("COM-F2", "название курса в обсуждении является ссылкой на страницу курса"),
            ("COM-F3", "сотрудник оставляет оценку и текстовый отзыв после обучения"),
            ("COM-F4", "модуль рассчитывает среднюю удовлетворенность по отзывам"),
            ("COM-F5", "HR и автор используют отзывы для корректировки учебных материалов"),
        ],
        "tests": [
            ("Переход по курсу", "HR нажимает название курса в обсуждении", "открывается страница выбранного курса"),
            ("Отправка отзыва", "пользователь заполняет форму и отправляет", "отзыв появляется в списке"),
            ("Средняя оценка", "в системе есть отзывы с оценками", "метрика удовлетворенности пересчитывается"),
            ("Список обсуждений", "открыта вкладка обратной связи", "сообщения показывают автора, курс, текст и дату"),
        ],
    },
]

SOURCES = [
    "ГОСТ 7.32-2017. Система стандартов по информации, библиотечному и издательскому делу. Отчет о научно-исследовательской работе.",
    "ГОСТ 7.0.5-2008. Библиографическая ссылка. Общие требования и правила составления.",
    "ГОСТ 19.201-78. Единая система программной документации. Техническое задание. Требования к содержанию и оформлению.",
    "ГОСТ 34.602-2020. Информационная технология. Комплекс стандартов на автоматизированные системы. Техническое задание.",
    "Sommerville I. Software Engineering. Pearson Education.",
    "Pressman R., Maxim B. Software Engineering: A Practitioner's Approach. McGraw-Hill.",
    "Fowler M. Patterns of Enterprise Application Architecture. Addison-Wesley.",
    "OMG. Business Process Model and Notation (BPMN) Specification.",
    "OMG. Unified Modeling Language (UML) Specification.",
    "Chen P. The Entity-Relationship Model - Toward a Unified View of Data.",
    "Moodle Documentation. Course management and activity completion.",
    "iSpring Learn Knowledge Base. Corporate learning management.",
    "WebTutor Documentation. Управление обучением и развитием персонала.",
    "TalentLMS Help Center. Gamification and reports.",
    "Camunda BPMN Reference. Business process modeling notation.",
    "UML-Diagrams.org. Activity diagrams and package diagrams.",
    "Lucidchart. Entity Relationship Diagram Tutorial.",
    "Next.js Documentation. App Router and Server Actions.",
    "React Documentation. Component model and state management.",
    "TypeScript Handbook. Static typing for JavaScript applications.",
    "PostgreSQL Documentation. Database design and SQL storage.",
    "Playwright Documentation. End-to-end testing.",
    "Vitest Documentation. Unit testing in TypeScript projects.",
    "BABOK Guide. Business analysis practices and requirements elicitation.",
]

ENTITY_FIELDS = {
    "User": ["id", "name", "role", "department", "xp"],
    "Course": ["id", "slug", "title", "status", "deadline"],
    "Lesson": ["id", "courseId", "title", "type", "duration"],
    "QuizQuestion": ["id", "courseId", "lessonId", "prompt"],
    "ProgressRecord": ["userId", "courseId", "percent", "score"],
    "Badge": ["id", "title", "rule", "tone"],
    "XpTransaction": ["id", "userId", "amount", "sourceType"],
    "RewardItem": ["id", "title", "costXp", "availableFor"],
    "RewardRedemption": ["id", "userId", "rewardId", "status"],
    "CourseAssignment": ["id", "userId", "courseId", "dueDate"],
    "AnalyticsRow": ["user", "course", "record"],
    "DiscussionMessage": ["id", "courseId", "authorId", "text"],
    "Feedback": ["id", "courseId", "userId", "rating"],
}


def font_path(name: str = "regular") -> str | None:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if name == "bold" else "/System/Library/Fonts/Supplemental/Times New Roman.ttf",
        "/Library/Fonts/Arial Unicode.ttf",
    ]
    return next((item for item in candidates if Path(item).exists()), None)


def pil_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    path = font_path("bold" if bold else "regular")
    return ImageFont.truetype(path, size=size) if path else ImageFont.load_default()


def wrap_text(text: str, width: int) -> str:
    lines = []
    for part in text.split("\n"):
        lines.extend(textwrap.wrap(part, width=width, break_long_words=False) or [""])
    return "\n".join(lines)


def wrap_text_px(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
    wrapped: list[str] = []
    for raw_line in text.split("\n"):
        words = raw_line.split()
        if not words:
            wrapped.append("")
            continue
        line = words[0]
        for word in words[1:]:
            candidate = f"{line} {word}"
            if draw.textbbox((0, 0), candidate, font=font)[2] <= max_width:
                line = candidate
            else:
                wrapped.append(line)
                line = word
        wrapped.append(line)
    return wrapped


def draw_text_box(
    draw: ImageDraw.ImageDraw,
    xy,
    text: str,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    fill="#14213d",
    align="center",
    padding=20,
    max_lines: int | None = None,
):
    x1, y1, x2, y2 = xy
    max_width = max(80, x2 - x1 - padding * 2)
    lines = wrap_text_px(draw, text, font, max_width)
    if max_lines and len(lines) > max_lines:
        lines = lines[: max_lines - 1] + [lines[max_lines - 1] + "..."]
    line_h = int((font.size if hasattr(font, "size") else 24) * 1.28)
    total_h = len(lines) * line_h
    y = y1 + max(0, (y2 - y1 - total_h) / 2)
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        if align == "left":
            x = x1 + padding
        elif align == "right":
            x = x2 - padding - (bbox[2] - bbox[0])
        else:
            x = x1 + (x2 - x1 - (bbox[2] - bbox[0])) / 2
        draw.text((x, y), line, fill=fill, font=font)
        y += line_h


def arrow(draw: ImageDraw.ImageDraw, start: tuple[int, int], end: tuple[int, int], fill="#2f5f8f", width=4):
    draw.line([start, end], fill=fill, width=width)
    angle = math.atan2(end[1] - start[1], end[0] - start[0])
    size = 14
    points = [
        end,
        (int(end[0] - size * math.cos(angle - math.pi / 6)), int(end[1] - size * math.sin(angle - math.pi / 6))),
        (int(end[0] - size * math.cos(angle + math.pi / 6)), int(end[1] - size * math.sin(angle + math.pi / 6))),
    ]
    draw.polygon(points, fill=fill)


def arrow_polyline(draw: ImageDraw.ImageDraw, points: list[tuple[int, int]], fill="#2f5f8f", width=4):
    for start, end in zip(points[:-2], points[1:-1]):
        draw.line([start, end], fill=fill, width=width)
    arrow(draw, points[-2], points[-1], fill=fill, width=width)


def connect_rects(draw: ImageDraw.ImageDraw, a, b, fill="#64748b", width=3):
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b
    ac = ((ax1 + ax2) // 2, (ay1 + ay2) // 2)
    bc = ((bx1 + bx2) // 2, (by1 + by2) // 2)
    if abs(bc[0] - ac[0]) >= abs(bc[1] - ac[1]):
        start = (ax2, ac[1]) if bc[0] > ac[0] else (ax1, ac[1])
        end = (bx1, bc[1]) if bc[0] > ac[0] else (bx2, bc[1])
    else:
        start = (ac[0], ay2) if bc[1] > ac[1] else (ac[0], ay1)
        end = (bc[0], by1) if bc[1] > ac[1] else (bc[0], by2)
    arrow(draw, start, end, fill=fill, width=width)


def box(draw: ImageDraw.ImageDraw, xy, text, fill="#eef6ff", outline="#2f5f8f", radius=18, font=None, align="center"):
    font = font or pil_font(27)
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=3)
    draw_text_box(draw, xy, text, font, align=align, padding=20)


def diagram_canvas(title: str):
    img = Image.new("RGB", (1800, 1150), "white")
    draw = ImageDraw.Draw(img)
    draw.rectangle((0, 0, 1800, 110), fill="#f3f6fb")
    draw_text_box(draw, (55, 18, 1745, 92), title, pil_font(38, bold=True), fill="#0f172a", align="left", padding=0)
    return img, draw


def build_diagrams(module: dict) -> list[Path]:
    DIAGRAM_DIR.mkdir(parents=True, exist_ok=True)
    paths = []
    key = module["key"]
    title = module["title"]

    img, draw = diagram_canvas(f"BPMN - процесс работы модуля «{title}»")
    lanes = list(dict.fromkeys(module["actors"]))
    if "Система LMS" in lanes:
        lanes = [lane for lane in lanes if lane != "Система LMS"] + ["Система LMS"]
    else:
        lanes.append("Система LMS")
    y = 130
    for lane in lanes:
        draw.rectangle((40, y, 1760, y + 180), outline="#d6deea", width=2, fill="#fbfcff")
        draw.rectangle((40, y, 250, y + 180), fill="#edf2f7", outline="#d6deea", width=2)
        draw_text_box(draw, (55, y + 20, 235, y + 160), lane, pil_font(24, True), fill="#1f2937", align="left")
        y += 180
    steps = [module["actors"][0], "Открывает раздел", "Вводит или выбирает данные", "Сохраняет результат", "Контролирует итог"]
    lane_centers = [130 + index * 180 + 90 for index in range(len(lanes))]
    system_idx = len(lanes) - 1
    secondary_idx = 1 if len(lanes) > 2 else 0
    data_idx = min(2, system_idx - 1) if len(lanes) > 3 else 0
    step_lane_indices = [0, secondary_idx, data_idx, system_idx, secondary_idx]
    xs = [410, 705, 1000, 1295, 1530]
    coords = [(x, lane_centers[lane_index]) for x, lane_index in zip(xs, step_lane_indices)]
    for i, (x, y) in enumerate(coords):
        rect = (x - 135, y - 52, x + 135, y + 52)
        box(draw, rect, steps[i], fill="#e8f7ee" if i in (0, 4) else "#eef6ff", font=pil_font(22))
        if i:
            prev_x, prev_y = coords[i - 1]
            mid_x = (prev_x + x) // 2
            arrow_polyline(
                draw,
                [(prev_x + 135, prev_y), (mid_x, prev_y), (mid_x, y), (x - 135, y)],
                fill="#2f5f8f",
                width=4,
            )
    path = DIAGRAM_DIR / f"{key}_01_bpmn.png"
    img.save(path)
    paths.append(path)

    img, draw = diagram_canvas(f"DFD - потоки данных модуля «{title}»")
    ext_left = (70, 245, 350, 365)
    p1 = (455, 235, 735, 375)
    p2 = (860, 235, 1140, 375)
    p3 = (1265, 235, 1545, 375)
    ext_right = (1600, 245, 1760, 365)
    box(draw, ext_left, module["actors"][0], fill="#fff7ed", font=pil_font(25, True))
    box(draw, ext_right, "Система LMS", fill="#fff7ed", font=pil_font(24, True))
    processes = [("P1", "Получение запроса"), ("P2", "Обработка бизнес-правил"), ("P3", "Сохранение и выдача результата")]
    process_rects = [p1, p2, p3]
    for rect, (code, text) in zip(process_rects, processes):
        box(draw, rect, f"{code}\n{text}", fill="#ecfeff", font=pil_font(21))
    mid_y = 305
    arrow(draw, (350, mid_y), (455, mid_y))
    arrow(draw, (735, mid_y), (860, mid_y))
    arrow(draw, (1140, mid_y), (1265, mid_y))
    arrow(draw, (1545, mid_y), (1600, mid_y))
    stores = module["entities"][:4]
    store_rects = []
    for i, store in enumerate(stores):
        x = 130 + i * 405
        rect = (x, 720, x + 310, 830)
        store_rects.append(rect)
        box(draw, rect, f"D{i+1}: {store}", fill="#f8fafc", font=pil_font(22))
    p2_bottom_targets = [(895, 375), (965, 375), (1035, 375), (1105, 375)]
    for rect, start in zip(store_rects, p2_bottom_targets):
        sx = (rect[0] + rect[2]) // 2
        arrow_polyline(draw, [start, (start[0], 600), (sx, 600), (sx, rect[1])], fill="#2f5f8f", width=3)
    path = DIAGRAM_DIR / f"{key}_02_dfd.png"
    img.save(path)
    paths.append(path)

    img, draw = diagram_canvas(f"IDEF0 - функциональная модель модуля «{title}»")
    process_box = (650, 365, 1150, 625)
    box(draw, process_box, f"A0\n{title}\nобработка сценариев", fill="#f0fdf4", font=pil_font(23))
    lefts = ["потребность в обучении", "данные пользователей", "учебные материалы"]
    tops = ["требования ВКР", "правила ролей", "сроки и статусы"]
    rights = ["обновленные данные", "интерфейс модуля", "отчет/результат"]
    bottoms = ["Next.js", "React", "TypeScript", "хранилище LMS"]
    for i, text in enumerate(lefts):
        y = 395 + i * 78
        draw_text_box(draw, (70, y - 38, 420, y + 38), text, pil_font(23), fill="#334155", align="left", padding=0)
        arrow(draw, (450, y), (650, y))
    for i, text in enumerate(tops):
        x = 735 + i * 165
        draw_text_box(draw, (x - 80, 155, x + 80, 225), text, pil_font(22), fill="#334155", padding=0)
        arrow(draw, (x, 245), (x, 365))
    for i, text in enumerate(rights):
        y = 405 + i * 82
        arrow(draw, (1150, y), (1385, y))
        draw_text_box(draw, (1410, y - 38, 1730, y + 38), text, pil_font(23), fill="#334155", align="left", padding=0)
    for i, text in enumerate(bottoms):
        x = 710 + i * 125
        draw_text_box(draw, (x - 70, 905, x + 70, 980), text, pil_font(21), fill="#334155", padding=0)
        arrow(draw, (x, 885), (x, 625))
    path = DIAGRAM_DIR / f"{key}_03_idef0.png"
    img.save(path)
    paths.append(path)

    img, draw = diagram_canvas(f"UML Activity - основной сценарий модуля «{title}»")
    steps = ["Начало", "Пользователь открывает раздел", "Система загружает состояние LMS", "Пользователь выполняет действие", "Проверка правил и прав доступа", "Сохранение результата", "Конец"]
    ys = [170, 300, 430, 560, 690, 840, 1000]
    for i, text in enumerate(steps):
        if i in (0, len(steps) - 1):
            draw.ellipse((780, ys[i] - 40, 1020, ys[i] + 40), fill="#e0f2fe", outline="#0369a1", width=3)
            draw.text((845, ys[i] - 15), text, fill="#0f172a", font=pil_font(24, True))
        elif i == 4:
            draw.polygon([(900, ys[i] - 65), (1070, ys[i]), (900, ys[i] + 65), (730, ys[i])], fill="#fff7ed", outline="#c2410c")
            draw.text((790, ys[i] - 26), wrap_text(text, 18), fill="#0f172a", font=pil_font(21, True))
        else:
            box(draw, (675, ys[i] - 48, 1125, ys[i] + 48), text, fill="#f8fafc", font=pil_font(24))
        if i:
            arrow(draw, (900, ys[i - 1] + 48), (900, ys[i] - 58 if i == 4 else ys[i] - 48))
    path = DIAGRAM_DIR / f"{key}_04_activity.png"
    img.save(path)
    paths.append(path)

    img, draw = diagram_canvas(f"ER - данные модуля «{title}»")
    entity_boxes = []
    for i, entity in enumerate(module["entities"]):
        col = i % 3
        row = i // 3
        x = 120 + col * 560
        y = 210 + row * 360
        entity_boxes.append((x, y, x + 420, y + 230))
    for start, end in zip(entity_boxes, entity_boxes[1:]):
        connect_rects(draw, start, end)
    for entity, rect in zip(module["entities"], entity_boxes):
        fields = "\n".join(ENTITY_FIELDS.get(entity, ["id", "title", "status", "createdAt"]))
        box(draw, rect, f"{entity}\n{fields}", fill="#f8fafc", font=pil_font(23), align="left")
    path = DIAGRAM_DIR / f"{key}_05_er.png"
    img.save(path)
    paths.append(path)

    img, draw = diagram_canvas(f"UML Package - архитектура модуля «{title}»")
    packages = [
        ("UI страницы", module["focus_file"]),
        ("Компоненты", "src/components"),
        ("Бизнес-логика", "src/lib/state.ts, src/lib/lms.ts"),
        ("Типы данных", "src/types/lms.ts"),
        ("Начальные данные", "src/data/lms.ts"),
        ("API/хранилище", "src/app/api/lms, PostgreSQL/JSON"),
    ]
    coords = [(95, 220), (690, 220), (1285, 220), (95, 650), (690, 650), (1285, 650)]
    for (label, detail), (x, y) in zip(packages, coords):
        draw.rectangle((x, y, x + 420, y + 260), fill="#f8fafc", outline="#334155", width=3)
        draw.rectangle((x, y, x + 170, y + 45), fill="#dbeafe", outline="#334155", width=3)
        draw.text((x + 18, y + 12), "package", fill="#0f172a", font=pil_font(20, True))
        draw.text((x + 28, y + 80), label, fill="#0f172a", font=pil_font(27, True))
        draw.text((x + 28, y + 130), wrap_text(detail, 28), fill="#334155", font=pil_font(21))
    for a, b in [((515, 350), (690, 350)), ((1110, 350), (1285, 350)), ((900, 480), (900, 650)), ((515, 780), (690, 780)), ((1110, 780), (1285, 780))]:
        arrow(draw, a, b, fill="#475569", width=3)
    path = DIAGRAM_DIR / f"{key}_06_package.png"
    img.save(path)
    paths.append(path)
    return paths


def set_doc_defaults(doc: Document):
    section = doc.sections[0]
    section.page_width = Mm(210)
    section.page_height = Mm(297)
    section.left_margin = Mm(30)
    section.right_margin = Mm(15)
    section.top_margin = Mm(20)
    section.bottom_margin = Mm(20)
    section.different_first_page_header_footer = True
    for style_name in ["Normal", "Heading 1", "Heading 2", "Heading 3"]:
        style = doc.styles[style_name]
        style.font.name = "Times New Roman"
        style.font.size = Pt(14 if style_name == "Normal" else 15)
        style._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    normal = doc.styles["Normal"].paragraph_format
    normal.first_line_indent = Cm(1.25)
    normal.line_spacing = 1.5
    normal.space_after = Pt(0)


def page_number_footer(doc: Document):
    p = doc.sections[0].footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    while p.runs:
        p.runs[0].clear()


def add_p(doc, text="", bold=False, align=None, first=True):
    p = doc.add_paragraph()
    p.paragraph_format.first_line_indent = Cm(1.25) if first else Cm(0)
    p.paragraph_format.line_spacing = 1.5
    r = p.add_run(text)
    r.bold = bold
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    if align:
        p.alignment = align
    return p


def add_heading(doc, text, level=1, structural=False):
    p = doc.add_paragraph()
    p.paragraph_format.first_line_indent = Cm(0 if structural else 1.25)
    p.paragraph_format.space_before = Pt(12 if level == 1 else 8)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER if structural else WD_ALIGN_PARAGRAPH.LEFT
    r = p.add_run(text.upper() if structural else text)
    r.bold = True
    r.font.name = "Times New Roman"
    r.font.size = Pt(15 if level <= 2 else 14)
    r._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    return p


def add_table(doc, headers, rows):
    table = doc.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.autofit = True
    for i, header in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        cell.paragraphs[0].add_run(header).bold = True
    for row in rows:
        cells = table.add_row().cells
        for i, value in enumerate(row):
            cells[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            cells[i].text = str(value)
    for row in table.rows:
        for cell in row.cells:
            for p in cell.paragraphs:
                p.paragraph_format.first_line_indent = Cm(0)
                p.paragraph_format.line_spacing = 1.15
                for run in p.runs:
                    run.font.name = "Times New Roman"
                    run.font.size = Pt(12)
                    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    doc.add_paragraph()
    return table


def page_break(doc):
    doc.add_page_break()


def add_toc(doc):
    add_heading(doc, "СОДЕРЖАНИЕ", structural=True)
    entries = [
        ("СОДЕРЖАНИЕ", "2"),
        ("ВВЕДЕНИЕ", "3"),
        ("1 АНАЛИЗ ПРЕДМЕТНОЙ ОБЛАСТИ", "5"),
        ("1.1 Описание предметной области и ключевых процессов", "5"),
        ("1.2 Формализация бизнес-процессов", "7"),
        ("1.3 Обзор существующих программных продуктов", "8"),
        ("1.4 Обоснование необходимости разработки", "9"),
        ("1.5 Выводы по первой главе", "10"),
        ("2 ПРОЕКТИРОВАНИЕ, РЕАЛИЗАЦИЯ И ТЕСТИРОВАНИЕ МОДУЛЯ", "11"),
        ("2.1 Предпроектное исследование и требования", "11"),
        ("2.2 Техническое задание и выбор технологий", "13"),
        ("2.3 Архитектурное проектирование", "14"),
        ("2.4 Реализация модуля", "16"),
        ("2.5 Тестирование", "17"),
        ("2.6 Выводы по второй главе", "18"),
        ("3 ТЕХНИКО-ЭКОНОМИЧЕСКОЕ ОБОСНОВАНИЕ РАЗРАБОТКИ", "19"),
        ("ЗАКЛЮЧЕНИЕ", "22"),
        ("СПИСОК ИСПОЛЬЗОВАННЫХ ИСТОЧНИКОВ", "23"),
        ("ПРИЛОЖЕНИЕ А. Диаграммы модуля", "25"),
        ("ПРИЛОЖЕНИЕ Б. Скриншот интерфейса", "31"),
    ]
    for title, page in entries:
        line = f"{title} {'.' * max(8, 78 - len(title))} {page}"
        add_p(doc, line, first=False)


def title_page(doc, module):
    for text in [
        "Федеральное государственное бюджетное образовательное учреждение высшего образования",
        "«РОССИЙСКАЯ АКАДЕМИЯ НАРОДНОГО ХОЗЯЙСТВА И ГОСУДАРСТВЕННОЙ СЛУЖБЫ",
        "при Президенте Российской Федерации»",
        "КОЛЛЕДЖ МНОГОУРОВНЕВОГО ПРОФЕССИОНАЛЬНОГО ОБРАЗОВАНИЯ",
        "Специальность 09.02.07 Информационные системы и программирование",
    ]:
        add_p(doc, text, align=WD_ALIGN_PARAGRAPH.CENTER, first=False)
    add_p(doc, "\nУТВЕРЖДАЮ\nЗам. директора КМПО РАНХиГС\n_________________ С.Ф. Гасанов\n«_____» _______________ 2026 г.", align=WD_ALIGN_PARAGRAPH.RIGHT, first=False)
    add_p(doc, "\nДИПЛОМНЫЙ ПРОЕКТ", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, first=False)
    add_p(doc, f"на тему: «{module['topic']}»", align=WD_ALIGN_PARAGRAPH.CENTER, first=False)
    add_p(doc, f"\n{module['title']}", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, first=False)
    add_p(doc, "\nВыполнил студент группы 401ИС-22\n___________________ /__________________/", first=False)
    add_p(doc, "Руководитель\n___________________ /__________________/", first=False)
    add_p(doc, "Нормоконтролер\n___________________ /__________________/", first=False)
    add_p(doc, "Консультант по технико-экономическому обоснованию проекта\n___________________ /__________________/", first=False)
    add_p(doc, "\nМОСКВА\n2026 г.", align=WD_ALIGN_PARAGRAPH.CENTER, first=False)
    page_break(doc)


def introduction(doc, module):
    add_heading(doc, "ВВЕДЕНИЕ", structural=True)
    add_p(doc, "Актуальность темы обусловлена ростом потребности организаций в управляемом дистанционном обучении сотрудников. Корпоративные знания быстро устаревают, новые сотрудники должны адаптироваться без длительных очных инструктажей, а HR-специалисты и руководители нуждаются в прозрачных данных о прохождении курсов, результатах тестирования и вовлеченности персонала.")
    add_p(doc, f"В рамках группового дипломного проекта разрабатывается платформа удаленного обучения сотрудников предприятий с элементами геймификации. Настоящая пояснительная записка посвящена направлению «{module['title']}». Выделение данного модуля позволяет описать не весь продукт сразу, а конкретную область ответственности, ее требования, архитектуру, реализацию и тестирование.")
    add_p(doc, f"Цель дипломного проекта: {module['goal']}.")
    add_p(doc, "Для достижения цели необходимо решить следующие задачи:")
    for task in module["tasks"]:
        add_p(doc, f"- {task}", first=False)
    add_p(doc, "Этапы реализации дипломного проекта представлены в таблице ниже.")
    add_table(doc, ["Этап", "Содержание", "Результат"], [
        ("1. Анализ", "изучение LMS, аналогов, ролей пользователей и требований преподавателя", "сформулированы объект, предмет, цель и задачи"),
        ("2. Проектирование", "описание процессов, структуры данных, интерфейсов и архитектурных связей", "подготовлены диаграммы и требования"),
        ("3. Реализация", "создание страниц, компонентов, функций состояния и интеграции с хранилищем", "получен работающий модуль LMS"),
        ("4. Тестирование", "проверка бизнес-логики и пользовательских сценариев", "подтверждена корректность ключевых функций"),
        ("5. Документирование", "оформление пояснительной записки, ТЗ, тестов и приложений", "подготовлен комплект материалов для защиты"),
    ])
    add_p(doc, f"Объект исследования: {COMMON_OBJECT}.")
    add_p(doc, f"Предмет исследования: {module['subject']}.")
    add_p(doc, "Методы исследования включают анализ предметной области, сравнительный анализ аналогичных LMS-решений, моделирование бизнес-процессов, функциональное проектирование, проектирование структуры данных, прототипирование интерфейсов, модульное и приемочное тестирование.")
    add_p(doc, f"Практическая значимость заключается в том, что разработанный модуль может применяться в составе корпоративной LMS для снижения ручных операций, повышения прозрачности обучения и улучшения качества взаимодействия пользователей с платформой. Ожидаемый результат: {module['module_result']}.")
    add_p(doc, "Пояснительная записка состоит из введения, трех глав, заключения, списка использованных источников и приложений. В приложениях приведены диаграммы BPMN, DFD, IDEF0, UML Activity, ER и UML Package, а также скриншот интерфейса реализованного модуля.")


def chapter_one(doc, module):
    add_heading(doc, "1 АНАЛИЗ ПРЕДМЕТНОЙ ОБЛАСТИ")
    add_heading(doc, "1.1 Описание предметной области и ключевых процессов", level=2)
    add_p(doc, "Корпоративная LMS представляет собой информационную систему, объединяющую учебный контент, пользователей, назначение курсов, контроль прогресса, проверку знаний, мотивационные механики и обратную связь. В отличие от обычного хранилища файлов LMS должна поддерживать роли, жизненный цикл материалов, дедлайны, историю обучения и аналитические показатели.")
    add_p(doc, f"Для модуля «{module['title']}» ключевым является процесс: {module['subject']}. Он связан с другими частями платформы через общие сущности данных, роли пользователей и состояние обучения. Поэтому проектирование модуля выполняется не изолированно, а с учетом общей архитектуры LearnHub LMS.")
    add_p(doc, "Основными участниками процесса являются: " + ", ".join(module["actors"]) + ". Каждый участник имеет собственные информационные потребности. Сотрудник ожидает понятного интерфейса и быстрых действий, HR-специалисту нужны контроль и отчетность, автору курса важны управление материалами и реакция пользователей.")
    add_table(doc, ["Проблема предметной области", "Проявление в ручном процессе", "Решение в модуле"], [
        ("Разрозненность данных", "сведения о курсах, прогрессе и результатах хранятся в разных файлах", "единое состояние LMS и связанные сущности"),
        ("Слабая прозрачность", "сложно понять, кто что прошел и где есть отставание", "статусы, прогресс, дедлайны и журнал действий"),
        ("Ручные операции", "HR и авторы повторно собирают одинаковые сведения", "формы, фильтры, расчеты и автоматическое сохранение"),
        ("Недостаток обратной связи", "качество материалов корректируется поздно", "обсуждения, отзывы, оценки и аналитические показатели"),
    ])
    add_heading(doc, "1.2 Формализация бизнес-процессов", level=2)
    add_p(doc, "Формализация процесса выполняется с применением нескольких нотаций. BPMN используется для описания последовательности действий и ролей. DFD показывает движение данных между пользователями, процессами и хранилищами. IDEF0 фиксирует входы, управляющие воздействия, выходы и механизмы реализации. UML Activity уточняет алгоритм основного сценария, ER-диаграмма описывает данные, а UML Package показывает архитектурную декомпозицию.")
    add_p(doc, "Такой набор диаграмм выбран потому, что каждая нотация закрывает отдельный аспект проектирования. Совместное использование диаграмм снижает риск неполного описания системы: бизнес-логика, данные, пользовательские сценарии и архитектурные зависимости рассматриваются согласованно.")
    add_heading(doc, "1.3 Обзор существующих программных продуктов", level=2)
    add_table(doc, ["Решение", "Сильные стороны", "Ограничения для проекта"], [
        ("Moodle", "широкая экосистема курсов, ролей, тестов и плагинов", "сложность настройки, избыточность для компактного дипломного прототипа"),
        ("iSpring Learn", "удобный корпоративный интерфейс, отчеты, мобильность", "закрытая платформа и зависимость от лицензии"),
        ("WebTutor", "развитые HR-сценарии и корпоративная аналитика", "высокая сложность внедрения и сопровождения"),
        ("TalentLMS", "облачная LMS с геймификацией и быстрым запуском", "ограниченная адаптация под индивидуальную архитектуру проекта"),
        ("LearnHub LMS", "модульная реализация на современном веб-стеке, понятное разделение ролей", "прототип требует расширения перед промышленной эксплуатацией"),
    ])
    add_p(doc, "Анализ аналогов показывает, что готовые LMS закрывают широкий круг задач, но не всегда подходят для демонстрации самостоятельной разработки отдельного модуля. Для дипломного проекта важно не только наличие функций, но и прозрачность архитектуры, возможность объяснить структуру данных, алгоритмы, тестирование и связь модуля с общей системой.")
    add_heading(doc, "1.4 Обоснование необходимости разработки", level=2)
    add_p(doc, f"Необходимость разработки модуля «{module['title']}» определяется тем, что в рамках LMS требуется прикладная реализация конкретного процесса, а не абстрактное описание платформы. Модуль должен работать в единой системе, использовать общие данные и при этом иметь самостоятельную ценность для выбранной роли пользователя.")
    add_p(doc, "К разрабатываемому модулю предъявляются требования функциональной полноты, понятности интерфейса, сохранности данных, разграничения доступа, тестируемости и возможности дальнейшего расширения. Эти требования учитываются в практической главе при проектировании и реализации.")
    add_table(doc, ["Граница модуля", "Входит в разработку", "Не входит в текущий прототип"], [
        ("Пользовательский сценарий", "основной рабочий процесс по выбранному модулю", "сложная кастомизация под разные компании"),
        ("Данные", "использование сущностей LMS и сохранение состояния", "полная промышленная миграция всех таблиц БД"),
        ("Интерфейс", "экран модуля, формы, таблицы, карточки и ссылки", "мобильное приложение как отдельный продукт"),
        ("Тестирование", "unit- и e2e-сценарии критичных действий", "нагрузочное тестирование больших корпоративных баз"),
    ])
    add_heading(doc, "1.5 Выводы по первой главе", level=2)
    add_p(doc, "В первой главе рассмотрена предметная область корпоративного дистанционного обучения и показано место выбранного модуля в общей LMS. Установлено, что модуль должен проектироваться как часть единой платформы, но иметь собственный предмет исследования, набор требований и сценарии тестирования.")
    add_p(doc, "Сравнение аналогичных решений подтвердило целесообразность разработки учебного прототипа LearnHub LMS. Он позволяет продемонстрировать самостоятельную реализацию функций, работу с данными, архитектурное проектирование, тестирование и визуальное описание процессов с помощью диаграмм.")


def chapter_two(doc, module, diagrams):
    add_heading(doc, f"2 ПРОЕКТИРОВАНИЕ, РЕАЛИЗАЦИЯ И ТЕСТИРОВАНИЕ МОДУЛЯ «{module['title'].upper()}»")
    add_heading(doc, "2.1 Предпроектное исследование и требования", level=2)
    add_p(doc, "Предпроектное исследование позволило определить состав пользователей, границы модуля, входные данные, ожидаемые результаты и связи с остальными частями платформы. Основное внимание уделено тому, чтобы модуль был понятен пользователю и при этом опирался на проверяемую структуру данных.")
    add_table(doc, ["Код", "Функциональное требование", "Приоритет"], [(code, text, "Высокий") for code, text in module["requirements"]])
    add_table(doc, ["Группа", "Нефункциональное требование"], [
        ("Удобство", "интерфейс должен быть понятен пользователю без дополнительной инструкции"),
        ("Надежность", "действия пользователя не должны нарушать целостность состояния LMS"),
        ("Безопасность", "доступ к управленческим разделам ограничивается ролью пользователя"),
        ("Производительность", "фильтрация и расчет показателей выполняются без заметной задержки на демо-наборе данных"),
        ("Расширяемость", "структура типов и функций допускает добавление новых курсов, правил и отчетов"),
    ])
    add_heading(doc, "2.2 Техническое задание и выбор технологий", level=2)
    add_p(doc, f"Техническое задание на модуль включает реализацию пользовательского сценария, хранение связанных сущностей, обновление состояния платформы и проверку результата тестами. Технологический стек проекта: {TECH_STACK}.")
    add_p(doc, "Выбор Next.js и React обусловлен необходимостью создать интерактивное веб-приложение с маршрутизацией, компонентной структурой и возможностью серверного API. TypeScript выбран для повышения надежности публичных типов данных и снижения количества ошибок при изменении структуры состояния LMS.")
    add_table(doc, ["Раздел ТЗ", "Содержание для данного модуля"], [
        ("Назначение", f"автоматизировать {module['subject']}"),
        ("Пользователи", ", ".join(module["actors"])),
        ("Входные данные", "действия пользователя, состояние LMS, выбранные курсы, сотрудники, прогресс и результаты"),
        ("Выходные данные", module["module_result"]),
        ("Ограничения", "работа в рамках демо-стенда, отсутствие внешней HRM-интеграции, учебный характер расчетов ТЭО"),
    ])
    add_heading(doc, "2.3 Архитектурное проектирование", level=2)
    add_p(doc, f"Модуль связан с общей архитектурой через типы данных {', '.join(module['entities'])}. Пользовательский интерфейс размещается в файле {module['focus_file']}. Изменение состояния выполняется через функции бизнес-логики в src/lib/state.ts и расчетные функции в src/lib/lms.ts.")
    add_p(doc, "Архитектура построена по принципу разделения ответственности: страницы отвечают за сценарий пользователя, компоненты - за визуальное представление, библиотечные функции - за расчет и изменение данных, API - за сохранение состояния, а типы - за единый контракт между слоями.")
    add_table(doc, ["Компонент", "Назначение", "Файлы проекта"], [
        ("Страница модуля", "реализует сценарий пользователя и связывает форму с состоянием", module["focus_file"]),
        ("Контекст LMS", "передает текущее состояние, пользователя и действия по приложению", "src/components/LmsProvider.tsx"),
        ("Бизнес-логика", "создает курсы, назначения, отзывы, попытки тестов, XP и расчеты", "src/lib/state.ts, src/lib/lms.ts"),
        ("Типы", "фиксируют контракт данных между UI, логикой и API", "src/types/lms.ts"),
        ("Хранилище", "сохраняет состояние через API, JSON fallback или PostgreSQL", "src/app/api/lms/state/route.ts"),
    ])
    add_table(doc, ["Сущность", "Ключевые поля", "Роль в модуле"], [
        (entity, ", ".join(ENTITY_FIELDS.get(entity, ["id", "title", "status"])), "используется для хранения и отображения данных модуля")
        for entity in module["entities"]
    ])
    add_heading(doc, "2.4 Реализация модуля", level=2)
    add_p(doc, f"В реализованном прототипе модуль доступен по маршруту {module['page']}. Его практический результат формулируется следующим образом: {module['module_result']}.")
    add_p(doc, "Данные приложения представлены в виде единого состояния AppState. Это упрощает демонстрацию связей между пользователями, курсами, назначениями, прогрессом, отзывами, тестами, XP и наградами. При наличии переменной DATABASE_URL состояние может сохраняться в PostgreSQL, а без нее используется локальный JSON fallback.")
    add_p(doc, "Реализация учитывает роли пользователей. Сотрудник получает доступ к личным и учебным сценариям, HR - к назначению, аналитике и системному управлению, автор - к созданию и дополнению учебных материалов. Такой подход соответствует требованиям корпоративной LMS.")
    add_table(doc, ["Роль", "Доступные действия в рамках модуля", "Контроль доступа"], [
        ("Сотрудник", "просмотр личных учебных данных, прохождение курсов, отзывы и достижения", "доступ к своим сценариям после входа"),
        ("HR", "назначение обучения, контроль сроков, аналитика, обратная связь и системные операции", "управленческие маршруты ограничены ролью HR"),
        ("Автор", "создание и сопровождение учебных материалов, тестовые вопросы, просмотр фидбека", "доступ к авторским сценариям и материалам"),
    ])
    add_heading(doc, "2.5 Тестирование", level=2)
    add_p(doc, "Тестирование разделено на модульные проверки бизнес-логики и e2e-проверки пользовательских сценариев. Unit-тесты подтверждают корректность расчетов, изменения состояния и нормализации данных. Playwright-тесты проверяют реальные переходы, формы, ограничения доступа и сохранение результата в интерфейсе.")
    add_table(doc, ["Сценарий", "Условие", "Ожидаемый результат"], module["tests"])
    add_table(doc, ["Критерий приемки", "Способ проверки"], [
        ("пользовательский сценарий выполняется без ошибок", "ручной прогон и Playwright e2e"),
        ("данные сохраняются в состоянии LMS", "проверка списка, таблицы или карточки после действия"),
        ("расчетные показатели соответствуют тестовым данным", "Vitest unit-тесты бизнес-логики"),
        ("доступ соответствует роли пользователя", "e2e-проверка маршрутов сотрудника, HR и автора"),
        ("интерфейс понятен и не требует внешней инструкции", "визуальная проверка экранов и скриншотов приложения"),
    ])
    add_heading(doc, "2.6 Выводы по второй главе", level=2)
    add_p(doc, f"Во второй главе выполнено проектирование и описание реализации модуля «{module['title']}». Сформированы функциональные и нефункциональные требования, определены основные сущности данных, описаны архитектурные связи и приведены сценарии тестирования.")
    add_p(doc, "Результаты проектирования показывают, что модуль может использоваться как самостоятельная часть группового дипломного проекта и одновременно интегрируется в общую платформу LearnHub LMS через единое состояние, маршруты приложения и общие функции бизнес-логики.")


def chapter_three(doc, module):
    add_heading(doc, "3 ТЕХНИКО-ЭКОНОМИЧЕСКОЕ ОБОСНОВАНИЕ РАЗРАБОТКИ")
    add_heading(doc, "3.1 Расчет затрат на разработку", level=2)
    add_p(doc, "Технико-экономическое обоснование выполнено для оценки трудоемкости, состава ресурсов и ожидаемого эффекта от внедрения модуля. Расчеты имеют учебный характер и отражают стоимость разработки прототипа в рамках дипломного проекта.")
    hours = module["hours"]
    add_table(doc, ["Этап", "Содержание работ", "Трудоемкость, ч"], [
        ("Анализ", "изучение предметной области, аналогов и требований", round(hours * 0.18)),
        ("Проектирование", "диаграммы, структура данных, интерфейсы, ТЗ", round(hours * 0.24)),
        ("Реализация", "разработка страниц, функций состояния и интеграции", round(hours * 0.36)),
        ("Тестирование", "unit/e2e проверки, исправление дефектов", round(hours * 0.14)),
        ("Документирование", "оформление пояснительной записки и приложений", hours - round(hours * 0.18) - round(hours * 0.24) - round(hours * 0.36) - round(hours * 0.14)),
    ])
    rate = 450
    cost = hours * rate
    monthly_effect = round(cost / 5)
    add_table(doc, ["Показатель", "Значение"], [
        ("Условная ставка исполнителя", f"{rate} руб./ч"),
        ("Общая трудоемкость", f"{hours} ч"),
        ("Расчетная стоимость работ", f"{cost:,} руб.".replace(",", " ")),
        ("ПО и инструменты", "0 руб., используются открытые или учебные инструменты"),
        ("Ожидаемый ежемесячный эффект", f"{monthly_effect:,} руб. за счет сокращения ручных операций".replace(",", " ")),
        ("Ориентировочный срок окупаемости", "5 месяцев"),
    ])
    add_table(doc, ["Риск", "Вероятность", "Способ минимизации"], [
        ("изменение требований преподавателя", "средняя", "модульная структура документов и диаграмм"),
        ("недостаточная полнота тестов", "средняя", "unit/e2e-проверки ключевых пользовательских сценариев"),
        ("ошибки при переносе состояния LMS", "низкая", "экспорт/импорт JSON и нормализация данных"),
        ("перегрузка интерфейса", "низкая", "разделение функций по страницам и ролям"),
    ])
    add_heading(doc, "3.2 Оценка экономической эффективности", level=2)
    add_p(doc, "Экономический эффект формируется за счет сокращения времени HR-специалистов и авторов курсов, уменьшения количества ручных сверок, повышения прозрачности данных и ускорения реакции на проблемы обучения. Дополнительный эффект выражается в росте вовлеченности сотрудников и снижении риска просроченных назначений.")
    add_p(doc, "Для промышленной версии системы экономическая эффективность может быть уточнена на основе количества сотрудников, среднего времени прохождения курсов, стоимости рабочего часа HR-специалиста, числа обязательных программ обучения и затрат на сопровождение инфраструктуры.")
    add_heading(doc, "3.3 Выводы по третьей главе", level=2)
    add_p(doc, "Расчет показал, что разработка модуля целесообразна в рамках учебного проекта: основные затраты связаны с трудоемкостью проектирования, реализации и тестирования, а используемые инструменты не требуют лицензионных расходов.")
    add_p(doc, "Внедрение модуля в составе LMS повышает управляемость корпоративного обучения и создает основу для дальнейшего развития платформы: подключения постоянной базы данных, расширения отчетности, добавления новых учебных сценариев и интеграции с HR-системами.")


def appendices(doc, module, diagrams):
    add_heading(doc, "ЗАКЛЮЧЕНИЕ", structural=True)
    add_p(doc, f"В ходе выполнения дипломного проекта по направлению «{module['title']}» были изучены процессы корпоративного дистанционного обучения, определены требования к модулю, выполнено проектирование, описана реализация и подготовлены сценарии тестирования.")
    add_p(doc, f"Поставленная цель достигнута: {module['goal']}. Практический результат выражается в том, что {module['module_result']}. Модуль может использоваться в составе единой платформы LearnHub LMS и развиваться вместе с остальными частями группового проекта.")
    add_heading(doc, "СПИСОК ИСПОЛЬЗОВАННЫХ ИСТОЧНИКОВ", structural=True)
    for i, source in enumerate(SOURCES, start=1):
        add_p(doc, f"{i}. {source}", first=False)
    add_heading(doc, "ПРИЛОЖЕНИЕ А. Диаграммы модуля", structural=True)
    names = ["BPMN", "DFD", "IDEF0", "UML Activity", "ER", "UML Package"]
    for i, path in enumerate(diagrams, start=1):
        add_p(doc, f"Рисунок А.{i} - {names[i-1]} диаграмма модуля «{module['title']}»", align=WD_ALIGN_PARAGRAPH.CENTER, first=False)
        doc.add_picture(str(path), width=Cm(15.8))
        doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
    shot = SCREENSHOT_DIR / module["screenshot"]
    if shot.exists():
        add_heading(doc, "ПРИЛОЖЕНИЕ Б. Скриншот интерфейса", structural=True)
        add_p(doc, f"Рисунок Б.1 - интерфейс модуля «{module['title']}» в реализованной LMS", align=WD_ALIGN_PARAGRAPH.CENTER, first=False)
        doc.add_picture(str(shot), width=Cm(16))
        doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER


def build_doc(module: dict):
    doc = Document()
    set_doc_defaults(doc)
    page_number_footer(doc)
    diagrams = build_diagrams(module)
    title_page(doc, module)
    add_toc(doc)
    page_break(doc)
    introduction(doc, module)
    chapter_one(doc, module)
    chapter_two(doc, module, diagrams)
    chapter_three(doc, module)
    appendices(doc, module, diagrams)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / module["file"]
    doc.save(path)
    return path


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    generated = [build_doc(module) for module in MODULES]
    archive = OUT_DIR / "LMS_5_module_docs.zip"
    archive_names = [
        "01_CMS_Content_Module.docx",
        "02_Gamification_Module.docx",
        "03_Employee_Profile_Module.docx",
        "04_Analytics_Reporting_Module.docx",
        "05_Communication_Feedback_Module.docx",
    ]
    with ZipFile(archive, "w", ZIP_DEFLATED) as zip_file:
        for path, archive_name in zip(generated, archive_names):
            zip_file.write(path, archive_name)
    readme = OUT_DIR / "README.md"
    readme.write_text(
        "# Документация по пяти модулям LMS\n\n"
        "Сгенерированы пять отдельных DOCX-файлов по структуре методических требований ВКР: титульный лист, реферат, содержание, введение, анализ предметной области, проектирование/реализация/тестирование, ТЭО, заключение, источники и приложения с диаграммами.\n\n"
        + "\n".join(f"- {path.name}" for path in generated)
        + f"\n\nАрхив для отправки: {archive.name}\n"
        + "\n",
        encoding="utf-8",
    )
    print("\n".join(str(path) for path in generated))


if __name__ == "__main__":
    main()
