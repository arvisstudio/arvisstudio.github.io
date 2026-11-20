/* Arvis «Редактор» — языки, редактор с печатью кода, дерево услуг, работы из портфолио. Тексты и цены — из старого main.js. */
(function () {
  "use strict";

  const NB = " "; // неразрывный пробел: «6 000 грн» не разрывается по строкам

  /* ---------- тексты ---------- */
  const I18N = {
    uk: {
      "meta.title": "Arvis — ШІ, сайти, боти та застосунки на замовлення",
      "meta.desc": "Arvis — команда розробників і ШІ: робимо ШІ-помічників, сайти, Telegram-ботів, застосунки, ігри в Roblox, відеомонтаж, дизайн і 3D-моделі на замовлення.",
      "skip": "Перейти до змісту",
      "nav.label": "Розділи", "nav.services": "Послуги", "nav.works": "Роботи", "svc.works": "Подивитися наші сайти", "nav.process": "Як працюємо", "nav.contact": "Контакти",
      "cta.short": "Написати",
      "hero.title": "Робимо сайти, ботів і ШІ‑помічників для вашого бізнесу",
      "hero.lead": "Люди продумують задачу й пишуть код, ШІ бере на себе рутину — тому швидко і без зайвих витрат. Ціну називаємо одразу після розмови.",
      "hero.cta": "Обговорити задачу", "hero.more": "Дивитися ціни",
      "hero.note": "Відповідаємо в Telegram. Обговорення безкоштовне.",
      "svc.title": "Що ми робимо",
      "svc.lead": "Оберіть напрям — покажемо, як це працює і скільки коштує.",
      "svc.cta": "Обговорити в Telegram",
      "svc.live": "Поговорити з живим прикладом — наш ШІ-продавець у Telegram",
      "svc.from": "від {n} грн",
      "svc.terms": "Передоплата 50%, решта — після здачі. Дві правки безкоштовно. Місяць підтримки в подарунок.",
      "sc.ai.name": "Помічник кав’ярні", "sc.ai.status": "онлайн 24/7",
      "sc.ai.m1": "Ви працюєте в неділю?", "sc.ai.m2": "Так, з 10:00 до 20:00. Забронювати вам столик?",
      "sc.ai.m3": "Так, на 15:00, на двох", "sc.ai.m4": "Готово ✓ Столик на 15:00 заброньовано",
      "sc.web.h": "Кава з собою", "sc.web.btn": "Замовити", "sc.web.toast": "Замовлення прийнято",
      "sc.tg.name": "Кав’ярня — бот", "sc.tg.m1": "Вітаємо! Оберіть розділ:",
      "sc.tg.b1": "Меню", "sc.tg.b2": "Доставка", "sc.tg.b3": "Адреса",
      "sc.tg.item": "Капучино", "sc.tg.add": "Додати в кошик", "sc.tg.m2": "Додано ✓ У кошику 1 товар", "sc.tg.pay": "Оформити — 65 ₴",
      "sc.app.hi": "Продажі за тиждень", "sc.app.unit": "замовлень", "sc.app.n1": "Нове замовлення №1024", "sc.app.n2": "Оплату отримано",
      "sc.3d.chip": "Готово до гри",
      "caption": "Субтитри з’являються самі",
      "how.title": "Як ми працюємо",
      "how.1.t": "Заявка", "how.1.d": "Пишете в Telegram, що потрібно. Можна голосовим.",
      "how.2.t": "Ціна й терміни", "how.2.d": "Уточнюємо деталі й називаємо точну ціну та термін.",
      "how.3.t": "Передоплата 50%", "how.3.d": "Після неї одразу беремося до роботи.",
      "how.4.t": "Розробка", "how.4.d": "Показуємо проміжні результати. Дві правки — безкоштовно.",
      "how.5.t": "Здача й підтримка", "how.5.d": "Решта 50% після здачі. Місяць підтримки — у подарунок.",
      "cta.title": "Розкажіть про задачу",
      "cta.text": "Кількох слів про ідею достатньо — відповімо з ціною та терміном.",
      "cta.btn": "Написати в Telegram",
      "foot.about": "Студія цифрових рішень: ШІ, сайти, боти, застосунки, ігри, відео й дизайн.",
      "foot.legal": "Roblox — товарний знак Roblox Corporation. Arvis — незалежна студія й не пов’язана з Roblox Corporation.",
    },
    ru: {
      "meta.title": "Arvis — ИИ, сайты, боты и приложения на заказ",
      "meta.desc": "Arvis — команда разработчиков и ИИ: делаем ИИ-помощников, сайты, Telegram-ботов, приложения, игры в Roblox, видеомонтаж, дизайн и 3D-модели на заказ.",
      "skip": "Перейти к содержанию",
      "nav.label": "Разделы", "nav.services": "Услуги", "nav.works": "Работы", "svc.works": "Посмотреть наши сайты", "nav.process": "Как работаем", "nav.contact": "Контакты",
      "cta.short": "Написать",
      "hero.title": "Делаем сайты, ботов и ИИ‑помощников для вашего бизнеса",
      "hero.lead": "Люди продумывают задачу и пишут код, ИИ берёт на себя рутину — поэтому быстро и без лишних затрат. Цену называем сразу после разговора.",
      "hero.cta": "Обсудить задачу", "hero.more": "Смотреть цены",
      "hero.note": "Отвечаем в Telegram. Обсуждение бесплатное.",
      "svc.title": "Что мы делаем",
      "svc.lead": "Выберите направление — покажем, как это работает и сколько стоит.",
      "svc.cta": "Обсудить в Telegram",
      "svc.live": "Поговорить с живым примером — наш ИИ-продавец в Telegram",
      "svc.from": "от {n} грн",
      "svc.terms": "Предоплата 50%, остальное — после сдачи. Две правки бесплатно. Месяц поддержки в подарок.",
      "sc.ai.name": "Помощник кофейни", "sc.ai.status": "онлайн 24/7",
      "sc.ai.m1": "Вы работаете в воскресенье?", "sc.ai.m2": "Да, с 10:00 до 20:00. Забронировать вам столик?",
      "sc.ai.m3": "Да, на 15:00, на двоих", "sc.ai.m4": "Готово ✓ Столик на 15:00 забронирован",
      "sc.web.h": "Кофе с собой", "sc.web.btn": "Заказать", "sc.web.toast": "Заказ принят",
      "sc.tg.name": "Кофейня — бот", "sc.tg.m1": "Добро пожаловать! Выберите раздел:",
      "sc.tg.b1": "Меню", "sc.tg.b2": "Доставка", "sc.tg.b3": "Адрес",
      "sc.tg.item": "Капучино", "sc.tg.add": "В корзину", "sc.tg.m2": "Добавлено ✓ В корзине 1 товар", "sc.tg.pay": "Оформить — 65 ₴",
      "sc.app.hi": "Продажи за неделю", "sc.app.unit": "заказов", "sc.app.n1": "Новый заказ №1024", "sc.app.n2": "Оплата получена",
      "sc.3d.chip": "Готово для игры",
      "caption": "Субтитры появляются сами",
      "how.title": "Как мы работаем",
      "how.1.t": "Заявка", "how.1.d": "Пишете в Telegram, что нужно. Можно голосовым.",
      "how.2.t": "Цена и сроки", "how.2.d": "Уточняем детали и называем точную цену и срок.",
      "how.3.t": "Предоплата 50%", "how.3.d": "После неё сразу берёмся за работу.",
      "how.4.t": "Разработка", "how.4.d": "Показываем промежуточные результаты. Две правки — бесплатно.",
      "how.5.t": "Сдача и поддержка", "how.5.d": "Остальные 50% после сдачи. Месяц поддержки — в подарок.",
      "cta.title": "Расскажите о задаче",
      "cta.text": "Пары слов об идее достаточно — ответим с ценой и сроком.",
      "cta.btn": "Написать в Telegram",
      "foot.about": "Студия цифровых решений: ИИ, сайты, боты, приложения, игры, видео и дизайн.",
      "foot.legal": "Roblox — товарный знак Roblox Corporation. Arvis — независимая студия и не связана с Roblox Corporation.",
    },
    en: {
      "meta.title": "Arvis — AI, websites, bots and apps to order",
      "meta.desc": "Arvis is a team of developers and AI: we build AI assistants, websites, Telegram bots, apps, Roblox games, video edits, design and 3D models to order.",
      "skip": "Skip to content",
      "nav.label": "Sections", "nav.services": "Services", "nav.works": "Work", "svc.works": "See our websites", "nav.process": "How we work", "nav.contact": "Contact",
      "cta.short": "Message us",
      "hero.title": "We build websites, bots and AI assistants for your business",
      "hero.lead": "People think the task through and write the code; AI takes care of the routine — so it's fast and costs less. You get a price right after the first chat.",
      "hero.cta": "Discuss your project", "hero.more": "See prices",
      "hero.note": "We reply on Telegram. The first chat is free.",
      "svc.title": "What we do",
      "svc.lead": "Pick a service to see how it works and what it costs.",
      "svc.cta": "Discuss on Telegram",
      "svc.live": "Talk to a live example — our AI sales assistant on Telegram",
      "svc.from": "from {n} UAH",
      "svc.terms": "50% upfront, the rest after delivery. Two rounds of changes are free. One month of support included.",
      "sc.ai.name": "Café assistant", "sc.ai.status": "online 24/7",
      "sc.ai.m1": "Are you open on Sunday?", "sc.ai.m2": "Yes, 10:00 to 20:00. Shall I book you a table?",
      "sc.ai.m3": "Yes, 3 pm for two", "sc.ai.m4": "Done ✓ Your table for 3 pm is booked",
      "sc.web.h": "Coffee to go", "sc.web.btn": "Order", "sc.web.toast": "Order received",
      "sc.tg.name": "Café bot", "sc.tg.m1": "Welcome! Pick a section:",
      "sc.tg.b1": "Menu", "sc.tg.b2": "Delivery", "sc.tg.b3": "Address",
      "sc.tg.item": "Cappuccino", "sc.tg.add": "Add to cart", "sc.tg.m2": "Added ✓ 1 item in your cart", "sc.tg.pay": "Checkout — 65 ₴",
      "sc.app.hi": "Sales this week", "sc.app.unit": "orders", "sc.app.n1": "New order #1024", "sc.app.n2": "Payment received",
      "sc.3d.chip": "Game-ready",
      "caption": "Captions appear on their own",
      "how.title": "How we work",
      "how.1.t": "Request", "how.1.d": "Tell us what you need on Telegram. A voice message works too.",
      "how.2.t": "Price and timeline", "how.2.d": "We clarify the details and give you an exact price and deadline.",
      "how.3.t": "50% upfront", "how.3.d": "We start right after the prepayment.",
      "how.4.t": "Development", "how.4.d": "You see progress along the way. Two rounds of changes are free.",
      "how.5.t": "Delivery and support", "how.5.d": "The other 50% after delivery. One month of support included.",
      "cta.title": "Tell us about your project",
      "cta.text": "A few words about your idea are enough — we'll reply with a price and timeline.",
      "cta.btn": "Message us on Telegram",
      "foot.about": "A digital solutions studio: AI, websites, bots, apps, games, video and design.",
      "foot.legal": "Roblox is a trademark of Roblox Corporation. Arvis is an independent studio and is not affiliated with Roblox Corporation.",
    },
  };

  /* ---------- услуги: название, описание, цены ---------- */
  const p = (n) => n.replace(/(\d) (?=\d)/g, "$1" + NB).replace(/ (грн|UAH)/g, NB + "$1");
  const SVC = {
    uk: {
      ai: ["ШІ-помічники та автоматизація", "Помічник відповідає клієнтам 24/7 у Telegram, Instagram чи на сайті, записує на послуги й приймає замовлення. Автоматизація прибирає рутину: таблиці, CRM, розсилки, звіти.",
        [["ШІ-помічник", "від 6 000 грн + ШІ за фактом"], ["Автоматизація рутини", "від 4 000 грн"]]],
      web: ["Сайти", "Від сторінки-візитки до інтернет-магазину. Зручні з телефона, швидко відкриваються, з кнопками дзвінка й замовлення.",
        [["Сайт для кафе, готелю чи місцевого бізнесу", "2 000 грн"], ["Лендинг", "від 4 000 грн"], ["Сайт компанії до 5 сторінок", "від 9 000 грн"], ["Інтернет-магазин", "від 20 000 грн"]]],
      tg: ["Telegram-боти та Mini Apps", "Бот приймає заявки й оплату, записує клієнтів і нагадує їм про візит. Mini App — повноцінний застосунок усередині Telegram.",
        [["Бот для заявок або запису", "від 2 500 грн"], ["Бот з оплатою, CRM і адмінкою", "від 7 000 грн"], ["Mini App", "від 15 000 грн"]]],
      app: ["Застосунки та програми", "Мобільні застосунки для Android та iOS, вебсервіси з особистим кабінетом, програми під Windows для вашої роботи.",
        [["Програма під Windows", "від 8 000 грн"], ["Вебсервіс, CRM, особистий кабінет", "від 20 000 грн"], ["Мобільний застосунок (Android + iOS)", "від 30 000 грн"]]],
      game: ["Ігри в Roblox", "Збираємо гру під ключ: мапа й 3D-моделі, геймплей, економіка, інтерфейс і монетизація. Або допрацюємо вашу.",
        [["Скрипти й доробки", "від 2 000 грн"], ["Гра під ключ", "від 25 000 грн"]]],
      video: ["Відеомонтаж", "Reels, TikTok і Shorts, які дивляться до кінця, та ролики для YouTube: субтитри, музика, ефекти. Рутину на кшталт субтитрів робить ШІ — тому швидко.",
        [["Reels / TikTok / Shorts", "від 300 грн за ролик"], ["Ролик для YouTube", "від 1 000 грн"]]],
      design: ["Графічний дизайн", "Логотип і фірмовий стиль, пости й банери для соцмереж, картки товарів для маркетплейсів.",
        [["Пост або банер", "від 200 грн"], ["Логотип", "від 1 500 грн"], ["Фірмовий стиль", "від 5 000 грн"]]],
      "3d": ["3D-моделі", "Моделі в Blender для ігор, реклами й 3D-друку: предмети, персонажі, оточення.",
        [["3D-предмет", "від 600 грн"], ["3D-персонаж", "від 2 500 грн"]]],
    },
    ru: {
      ai: ["ИИ-помощники и автоматизация", "Помощник отвечает клиентам 24/7 в Telegram, Instagram или на сайте, записывает на услуги и принимает заказы. Автоматизация убирает рутину: таблицы, CRM, рассылки, отчёты.",
        [["ИИ-помощник", "от 6 000 грн + ИИ по факту"], ["Автоматизация рутины", "от 4 000 грн"]]],
      web: ["Сайты", "От страницы-визитки до интернет-магазина. Удобные с телефона, быстро открываются, с кнопками звонка и заказа.",
        [["Сайт для кафе, отеля или местного бизнеса", "2 000 грн"], ["Лендинг", "от 4 000 грн"], ["Сайт компании до 5 страниц", "от 9 000 грн"], ["Интернет-магазин", "от 20 000 грн"]]],
      tg: ["Telegram-боты и Mini Apps", "Бот принимает заявки и оплату, записывает клиентов и напоминает им о визите. Mini App — полноценное приложение внутри Telegram.",
        [["Бот для заявок или записи", "от 2 500 грн"], ["Бот с оплатой, CRM и админкой", "от 7 000 грн"], ["Mini App", "от 15 000 грн"]]],
      app: ["Приложения и программы", "Мобильные приложения для Android и iOS, веб-сервисы с личным кабинетом, программы под Windows для вашей работы.",
        [["Программа под Windows", "от 8 000 грн"], ["Веб-сервис, CRM, личный кабинет", "от 20 000 грн"], ["Мобильное приложение (Android + iOS)", "от 30 000 грн"]]],
      game: ["Игры в Roblox", "Собираем игру под ключ: карта и 3D-модели, геймплей, экономика, интерфейс и монетизация. Или доработаем вашу.",
        [["Скрипты и доработки", "от 2 000 грн"], ["Игра под ключ", "от 25 000 грн"]]],
      video: ["Видеомонтаж", "Reels, TikTok и Shorts, которые досматривают, и ролики для YouTube: субтитры, музыка, эффекты. Рутину вроде субтитров делает ИИ — поэтому быстро.",
        [["Reels / TikTok / Shorts", "от 300 грн за ролик"], ["Ролик для YouTube", "от 1 000 грн"]]],
      design: ["Графический дизайн", "Логотип и фирменный стиль, посты и баннеры для соцсетей, карточки товаров для маркетплейсов.",
        [["Пост или баннер", "от 200 грн"], ["Логотип", "от 1 500 грн"], ["Фирменный стиль", "от 5 000 грн"]]],
      "3d": ["3D-модели", "Модели в Blender для игр, рекламы и 3D-печати: предметы, персонажи, окружение.",
        [["3D-предмет", "от 600 грн"], ["3D-персонаж", "от 2 500 грн"]]],
    },
    en: {
      ai: ["AI assistants and automation", "An assistant answers your customers 24/7 on Telegram, Instagram or your website, books appointments and takes orders. Automation handles spreadsheets, CRM, mailings and reports.",
        [["AI assistant", "from 6,000 UAH + AI usage"], ["Routine automation", "from 4,000 UAH"]]],
      web: ["Websites", "From a one-page site to an online store. Mobile-friendly, fast, with call and order buttons.",
        [["Website for a café, hotel or local business", "2,000 UAH"], ["Landing page", "from 4,000 UAH"], ["Company website, up to 5 pages", "from 9,000 UAH"], ["Online store", "from 20,000 UAH"]]],
      tg: ["Telegram bots and Mini Apps", "A bot takes requests and payments, books customers and reminds them about visits. A Mini App is a full app inside Telegram.",
        [["Bot for requests or bookings", "from 2,500 UAH"], ["Bot with payments, CRM and admin panel", "from 7,000 UAH"], ["Mini App", "from 15,000 UAH"]]],
      app: ["Apps and software", "Mobile apps for Android and iOS, web services with user accounts, Windows programs for your workflow.",
        [["Windows program", "from 8,000 UAH"], ["Web service, CRM, user accounts", "from 20,000 UAH"], ["Mobile app (Android + iOS)", "from 30,000 UAH"]]],
      game: ["Roblox games", "We build a game end to end: map and 3D models, gameplay, economy, UI and monetization. Or we improve yours.",
        [["Scripts and fixes", "from 2,000 UAH"], ["Turnkey game", "from 25,000 UAH"]]],
      video: ["Video editing", "Reels, TikToks and Shorts people watch to the end, plus YouTube videos: captions, music, effects. AI does the routine like captions — so it's fast.",
        [["Reels / TikTok / Shorts", "from 300 UAH per video"], ["YouTube video", "from 1,000 UAH"]]],
      design: ["Graphic design", "Logos and brand identity, social posts and banners, product cards for marketplaces.",
        [["Post or banner", "from 200 UAH"], ["Logo", "from 1,500 UAH"], ["Brand identity", "from 5,000 UAH"]]],
      "3d": ["3D models", "Blender models for games, ads and 3D printing: props, characters, environments.",
        [["3D prop", "from 600 UAH"], ["3D character", "from 2,500 UAH"]]],
    },
  };
  // «от …» в строке списка — самая низкая цена направления
  const FROM = { ai: 4000, web: 2000, tg: 2500, app: 8000, game: 2000, video: 300, design: 200, "3d": 600 };

  /* ---------- новые тексты «Редактора» ---------- */
  const EXTRA = {
    uk: { "hero.eyebrow": "// сайти · боти · ШІ · застосунки · ігри", "hero.title2": "Пишемо код, який працює на ваш бізнес",
      "ed.label": "Приклад: код друкується, поруч — результат", "ed.result": "результат", "ed.site.h": "Кава з собою",
      "ed.site.p": "Щодня 8:00–20:00", "ed.game.coins": "Монети", "ed.foot": "код друкується сам",
      "svc.comment": "// оберіть напрям — покажемо ціни", "works.comment": "// концепт-сайти, які ми зробили", "works.title": "Наші роботи",
      "works.all": "Усі роботи →", "cta.cmd": "arvis написати --telegram" },
    ru: { "hero.eyebrow": "// сайты · боты · ИИ · приложения · игры", "hero.title2": "Пишем код, который работает на ваш бизнес",
      "ed.label": "Пример: код печатается, рядом — результат", "ed.result": "результат", "ed.site.h": "Кофе с собой",
      "ed.site.p": "Каждый день 8:00–20:00", "ed.game.coins": "Монеты", "ed.foot": "код печатается сам",
      "svc.comment": "// выберите направление — покажем цены", "works.comment": "// концепт-сайты, которые мы сделали", "works.title": "Наши работы",
      "works.all": "Все работы →", "cta.cmd": "arvis написать --telegram" },
    en: { "hero.eyebrow": "// websites · bots · AI · apps · games", "hero.title2": "We write code that works for your business",
      "ed.label": "Example: code types itself, the result appears next to it", "ed.result": "result", "ed.site.h": "Coffee to go",
      "ed.site.p": "Daily 8:00–20:00", "ed.game.coins": "Coins", "ed.foot": "code types itself",
      "svc.comment": "// pick a service to see prices", "works.comment": "// concept sites we've built", "works.title": "Our work",
      "works.all": "All work →", "cta.cmd": "arvis message --telegram" },
  };
  Object.keys(EXTRA).forEach((l) => Object.assign(I18N[l], EXTRA[l]));

  const ORDER = Object.keys(FROM);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lang = "uk";
  const t = (k) => I18N[lang][k] || I18N.uk[k] || k;
  const money = (n) => lang === "en" ? n.toLocaleString("en-US") : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- редактор: код печатается, справа появляется результат ---------- */
  // строка — список кусочков [класс, текст]; «{ключ}» внутри текста — перевод
  const SNIPPETS = {
    site: { lines: [
      [["k", "<section"], ["", " "], ["n", "class"], ["", "="], ["s", '"hero"'], ["k", ">"]],
      [["", "  "], ["k", "<h1>"], ["", "{ed.site.h}"], ["k", "</h1>"]],
      [["", "  "], ["k", "<p>"], ["", "{ed.site.p}"], ["k", "</p>"]],
      [["", "  "], ["k", "<button>"], ["", "{sc.web.btn}"], ["k", "</button>"]],
      [["k", "</section>"]],
    ], reveal: { 0: [".mini-nav"], 1: ["h4"], 2: ["p"], 3: [".mini-btn"] } },
    bot: { lines: [
      [["c", "# Telegram-бот кав’ярні"]],
      [["n", "@bot.message"], ["", "("], ["s", '"/start"'], ["", ")"]],
      [["k", "async def"], ["", " start(msg):"]],
      [["", "  "], ["k", "await"], ["", " msg.answer("]],
      [["", "    "], ["s", '"{sc.tg.m1}"'], ["", ","]],
      [["", "    buttons=["], ["s", '"{sc.tg.b1}"'], ["", ", "], ["s", '"{sc.tg.b2}"'], ["", "])"]],
    ], reveal: { 1: [".msg.me"], 5: [".msg:not(.me)"] } },
    game: { lines: [
      [["c", "-- Roblox: монета дає очко"]],
      [["k", "local"], ["", " coin = workspace.Coin"]],
      [["", "coin.Touched:"], ["n", "Connect"], ["", "("], ["k", "function"], ["", "(hit)"]],
      [["", "  player.coins += 1"]],
      [["", "  coin:"], ["n", "Destroy"], ["", "()"]],
      [["k", "end"], ["", ")"]],
    ], reveal: { 1: [".hud", ".world"] } },
  };
  const TABS = ["site", "bot", "game"];
  const codeEl = document.getElementById("code");
  const editor = document.getElementById("editor");
  const lnCount = document.getElementById("ln-count");
  let tab = "site", run = 0, edVisible = true;

  const fill = (s) => s.replace(/\{([a-z0-9.]+)\}/g, (_, k) => t(k));
  function lineText(line) { return line.map(([, s]) => fill(s)).join(""); }
  function renderCode(id) {
    codeEl.innerHTML = SNIPPETS[id].lines.map((line) =>
      '<span class="l"><span class="t" style="--c:0">' + line.map(([c, s]) => (c ? `<span class="${c}">${esc(fill(s))}</span>` : esc(fill(s)))).join("") + "</span></span>").join("");
  }
  const pvOf = (id) => editor.querySelector(`.pv[data-pv="${id}"]`);
  function resetPreview(id) {
    editor.querySelectorAll(".pv").forEach((p) => p.classList.toggle("on", p.dataset.pv === id));
    const pv = pvOf(id);
    pv.querySelectorAll(".b").forEach((b) => b.classList.remove("show", "press"));
    const world = pv.querySelector(".world");
    if (world) { world.classList.remove("go", "got"); pv.querySelector(".coins").textContent = "0"; }
  }
  function reveal(id, idx) {
    (SNIPPETS[id].reveal[idx] || []).forEach((sel) => pvOf(id).querySelectorAll(sel).forEach((el) => el.classList.add("show")));
  }
  function selectTab(id) {
    tab = id;
    editor.querySelectorAll(".ed-tab").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === id)));
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  async function waitVisible(my) { while (!edVisible && my === run) await sleep(250); }

  async function play(id, my) {
    selectTab(id);
    renderCode(id);
    resetPreview(id);
    const lines = Array.from(codeEl.querySelectorAll(".t"));
    const caret = document.createElement("span");
    caret.className = "caret";
    for (let i = 0; i < lines.length; i++) {
      if (my !== run) return false;
      const text = lineText(SNIPPETS[id].lines[i]);
      const indent = text.length - text.trimStart().length;
      lines[i].parentNode.appendChild(caret);
      lnCount.textContent = "Ln " + (i + 1);
      for (let c = indent; c <= text.length; c++) {
        if (my !== run) return false;
        lines[i].style.setProperty("--c", c);
        await sleep(c === indent ? 120 : 26 + Math.random() * 30);
      }
      reveal(id, i);
      await waitVisible(my);
    }
    caret.remove();
    // «запуск»: на сайте нажимают кнопку, в игре герой бежит за монетой
    const pv = pvOf(id);
    if (id === "site") {
      await sleep(700); pv.querySelector(".mini-btn").classList.add("press");
      await sleep(220); pv.querySelector(".mini-btn").classList.remove("press"); pv.querySelector(".toast").classList.add("show");
    } else if (id === "game") {
      await sleep(400); pv.querySelector(".world").classList.add("go");
      await sleep(1000); pv.querySelector(".world").classList.add("got"); pv.querySelector(".coins").textContent = "1";
    }
    await sleep(2600);
    return my === run;
  }
  async function loop(start) {
    const my = ++run;
    let i = TABS.indexOf(start);
    while (my === run) {
      await waitVisible(my);
      const ok = await play(TABS[i], my);
      if (!ok) return;
      i = (i + 1) % TABS.length;
    }
  }
  function showStatic(id) {   // без анимаций: код и результат сразу целиком
    selectTab(id); renderCode(id); resetPreview(id);
    codeEl.querySelectorAll(".t").forEach((el, i) => el.style.setProperty("--c", lineText(SNIPPETS[id].lines[i]).length));
    Object.keys(SNIPPETS[id].reveal).forEach((k) => reveal(id, Number(k)));
    const pv = pvOf(id);
    if (id === "site") pv.querySelector(".toast").classList.add("show");
  }
  editor.querySelectorAll(".ed-tab").forEach((b) => b.addEventListener("click", () => (reduce ? showStatic(b.dataset.tab) : loop(b.dataset.tab))));
  new IntersectionObserver((es) => es.forEach((e) => { edVisible = e.isIntersecting; }), { threshold: 0.15 }).observe(editor);

  /* ---------- услуги: дерево, строка раскрывается в цены ---------- */
  const tree = document.getElementById("tree");
  let openId = "ai";
  function renderTree() {
    tree.innerHTML = ORDER.map((id) => {
      const [name, desc, prices] = SVC[lang][id];
      const open = id === openId;
      const live = id === "ai" ? `<p><a class="link" href="https://t.me/arvisstudio_bot" target="_blank" rel="noopener">${esc(t("svc.live"))}</a></p>` : "";
      return `<li class="row${open ? " open" : ""}" data-svc="${id}">
        <button class="row-btn" type="button" aria-expanded="${open}" aria-controls="p-${id}">
          <span class="row-path">${id}/</span><span class="row-name">${esc(name)}</span><span class="row-dots" aria-hidden="true"></span>
          <span class="row-from">${esc(t("svc.from").replace("{n}", money(FROM[id])))}</span></button>
        <div class="row-panel" id="p-${id}" ${open ? "" : "hidden"}><div>
          <p class="row-desc">${esc(desc)}</p>
          <ul class="prices">${prices.map(([n, pr]) => `<li><span>${esc(n)}</span><i></i><b>${esc(p(pr))}</b></li>`).join("")}</ul>
          ${live}<a class="btn" href="https://t.me/arvisstudio_bot" target="_blank" rel="noopener">${esc(t("svc.cta"))}</a>
        </div></div></li>`;
    }).join("");
  }
  tree.addEventListener("click", (e) => {
    const btn = e.target.closest(".row-btn");
    if (!btn) return;
    const id = btn.parentNode.dataset.svc;
    openId = openId === id ? null : id;
    tree.querySelectorAll(".row").forEach((row) => {
      const on = row.dataset.svc === openId;
      row.classList.toggle("open", on);
      row.querySelector(".row-btn").setAttribute("aria-expanded", String(on));
      row.querySelector(".row-panel").hidden = !on;
    });
  });

  /* ---------- работы: три последние из портфолио ---------- */
  const grid = document.getElementById("work-grid");
  fetch("../portfolio/works.json", { cache: "no-cache" }).then((r) => r.json()).then((list) => {
    grid.innerHTML = list.slice(0, 3).map((w) => `<a class="work" href="../portfolio/${esc(w.url)}">
      <img src="../portfolio/shots/${esc(w.slug)}.jpg" alt="${esc(w.name)}" loading="lazy" width="1440" height="900">
      <span class="work-cap"><span class="mono">${esc(w.slug)}/</span><b>${esc(w.name)}</b></span></a>`).join("");
  }).catch(() => { grid.hidden = true; });

  /* ---------- «коммиты» появляются по одному ---------- */
  const steps = Array.from(document.querySelectorAll(".log li"));
  if (reduce || !("IntersectionObserver" in window)) steps.forEach((li) => li.classList.add("in"));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      steps.forEach((li, i) => setTimeout(() => li.classList.add("in"), i * 140));
      io.disconnect();
    }), { threshold: 0.2 });
    io.observe(document.querySelector(".log"));
  }

  /* ---------- язык ---------- */
  function storedLang() { try { return localStorage.getItem("arvis-lang"); } catch (e) { return null; } }
  function guessLang() {
    const l = (navigator.language || "").toLowerCase();
    return l.startsWith("uk") ? "uk" : /^(ru|be|kk)/.test(l) ? "ru" : "en";
  }
  function setLang(next) {
    lang = I18N[next] ? next : "uk";
    const dict = I18N[lang];
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => { const v = dict[el.dataset.i18n]; if (v) el.textContent = v; });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => { const v = dict[el.dataset.i18nAria]; if (v) el.setAttribute("aria-label", v); });
    document.title = dict["meta.title"];
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", dict["meta.desc"]);
    document.querySelectorAll(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    try { localStorage.setItem("arvis-lang", lang); } catch (e) { /* без памяти — не страшно */ }
    renderTree();
    showStatic(tab);            // сразу на новом языке, даже если редактор сейчас не на экране
    if (!reduce) loop(tab);
  }
  document.querySelectorAll(".lang button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
  setLang(storedLang() || guessLang());
})();
