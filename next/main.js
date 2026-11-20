/* Arvis 2 — языки, код от прокрутки, дерево услуг, работы из портфолио. Тексты и цены — из старого main.js. 3D — в scene.js. */
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

  /* ---------- новые тексты ---------- */
  const EXTRA = {
    uk: { "hero.eyebrow": "// сайти · боти · ШІ · застосунки · ігри", "hero.title3": "Пишемо код, який оживає", "hero.scroll": "↓ гортайте — код пишеться сам",
      "ch.from": "від", "ch.uah": "грн",
      "ch.site.tag": "сайти", "ch.site.t": "Сайти, які не схожі на шаблон", "ch.site.d": "3D, живі переходи, запис і замовлення прямо на сторінці. Швидкі з телефона — без гальм.", "ch.site.link": "Подивитися наші сайти →",
      "ch.bot.tag": "боти й ШІ", "ch.bot.t": "Боти, які працюють за вас 24/7", "ch.bot.d": "Telegram-бот приймає заявки й оплату, ШІ-помічник відповідає клієнтам і записує на послуги, поки ви займаєтесь справою.", "ch.bot.link": "Поговорити з нашим ШІ-продавцем →",
      "ch.game.tag": "ігри й застосунки", "ch.game.t": "Ігри в Roblox і застосунки", "ch.game.d": "Гра під ключ: мапа, 3D-моделі, економіка, монетизація. Застосунки для Android, iOS і Windows під вашу роботу.", "ch.game.link": "Усі послуги й ціни ↓",
      "svc.comment": "// оберіть напрям — покажемо ціни", "works.comment": "// концепт-сайти, які ми зробили", "works.title": "Наші роботи", "works.all": "Усі роботи →",
      "cta.cmd": "arvis написати --telegram",
      "code.idea": "ваша ідея", "code.site.h": "Кава з собою", "code.site.p": "Щодня 8:00–20:00", "code.cta.1": "відкриваю @arvisstudio_bot…", "code.cta.2": "відповімо з ціною та терміном" },
    ru: { "hero.eyebrow": "// сайты · боты · ИИ · приложения · игры", "hero.title3": "Пишем код, который оживает", "hero.scroll": "↓ листайте — код пишется сам",
      "ch.from": "от", "ch.uah": "грн",
      "ch.site.tag": "сайты", "ch.site.t": "Сайты, не похожие на шаблон", "ch.site.d": "3D, живые переходы, запись и заказ прямо на странице. Быстрые с телефона — без тормозов.", "ch.site.link": "Посмотреть наши сайты →",
      "ch.bot.tag": "боты и ИИ", "ch.bot.t": "Боты, которые работают за вас 24/7", "ch.bot.d": "Telegram-бот принимает заявки и оплату, ИИ-помощник отвечает клиентам и записывает на услуги, пока вы занимаетесь делом.", "ch.bot.link": "Поговорить с нашим ИИ-продавцом →",
      "ch.game.tag": "игры и приложения", "ch.game.t": "Игры в Roblox и приложения", "ch.game.d": "Игра под ключ: карта, 3D-модели, экономика, монетизация. Приложения для Android, iOS и Windows под вашу работу.", "ch.game.link": "Все услуги и цены ↓",
      "svc.comment": "// выберите направление — покажем цены", "works.comment": "// концепт-сайты, которые мы сделали", "works.title": "Наши работы", "works.all": "Все работы →",
      "cta.cmd": "arvis написать --telegram",
      "code.idea": "ваша идея", "code.site.h": "Кофе с собой", "code.site.p": "Каждый день 8:00–20:00", "code.cta.1": "открываю @arvisstudio_bot…", "code.cta.2": "ответим с ценой и сроком" },
    en: { "hero.eyebrow": "// websites · bots · AI · apps · games", "hero.title3": "We write code that comes alive", "hero.scroll": "↓ scroll — the code writes itself",
      "ch.from": "from", "ch.uah": "UAH",
      "ch.site.tag": "websites", "ch.site.t": "Websites that don't look like templates", "ch.site.d": "3D, live transitions, bookings and orders right on the page. Fast on phones — no lag.", "ch.site.link": "See our websites →",
      "ch.bot.tag": "bots & AI", "ch.bot.t": "Bots that work for you 24/7", "ch.bot.d": "A Telegram bot takes requests and payments, an AI assistant answers customers and books appointments while you run your business.", "ch.bot.link": "Talk to our AI sales assistant →",
      "ch.game.tag": "games & apps", "ch.game.t": "Roblox games and apps", "ch.game.d": "Turnkey games: map, 3D models, economy, monetization. Android, iOS and Windows apps for your workflow.", "ch.game.link": "All services and prices ↓",
      "svc.comment": "// pick a service to see prices", "works.comment": "// concept sites we've built", "works.title": "Our work", "works.all": "All work →",
      "cta.cmd": "arvis message --telegram",
      "code.idea": "your idea", "code.site.h": "Coffee to go", "code.site.p": "Daily 8:00–20:00", "code.cta.1": "opening @arvisstudio_bot…", "code.cta.2": "we'll reply with price and timeline" },
  };
  Object.keys(EXTRA).forEach((l) => Object.assign(I18N[l], EXTRA[l]));

  const ORDER = Object.keys(FROM);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const BASE = /\/next\/?/.test(location.pathname) ? "../" : "";   // черновик лежит в /next/, главная — в корне
  let lang = "uk";
  const t = (k) => I18N[lang][k] || I18N.uk[k] || k;
  const money = (n) => lang === "en" ? n.toLocaleString("en-US") : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  document.querySelectorAll("[data-portfolio]").forEach((a) => a.setAttribute("href", BASE + "portfolio/"));

  /* ---------- код сверху: печатается от прокрутки ---------- */
  const CODE = {
    hero: { file: "arvis.js", lines: [
      [["c", "// arvis.js"]],
      [["k", "const"], ["", " idea = "], ["s", '"{code.idea}"'], ["", ";"]],
      [["k", "const"], ["", " app = arvis."], ["n", "build"], ["", "(idea);"]],
      [["", "app."], ["n", "launch"], ["", "();"]],
    ] },
    site: { file: "kavarnia.html", lines: [
      [["k", "<section"], ["", " class="], ["s", '"hero"'], ["k", ">"]],
      [["", "  "], ["k", "<h1>"], ["", "{code.site.h}"], ["k", "</h1>"]],
      [["", "  "], ["k", "<p>"], ["", "{code.site.p}"], ["k", "</p>"]],
      [["", "  "], ["k", "<button>"], ["", "{sc.web.btn}"], ["k", "</button>"]],
      [["k", "</section>"]],
    ] },
    bot: { file: "bot.py", lines: [
      [["n", "@bot.message"], ["", "("], ["s", '"/start"'], ["", ")"]],
      [["k", "async def"], ["", " start(msg):"]],
      [["", "  "], ["k", "await"], ["", " msg.answer("]],
      [["", "    "], ["s", '"{sc.tg.m1}"'], ["", ","]],
      [["", "    buttons=["], ["s", '"{sc.tg.b1}"'], ["", ", "], ["s", '"{sc.tg.b2}"'], ["", "])"]],
    ] },
    game: { file: "coin.lua", lines: [
      [["k", "local"], ["", " coin = workspace.Coin"]],
      [["", "coin.Touched:"], ["n", "Connect"], ["", "("], ["k", "function"], ["", "()"]],
      [["", "  player.coins += 1"]],
      [["", "  coin:"], ["n", "Destroy"], ["", "()"]],
      [["k", "end"], ["", ")"]],
    ] },
    cta: { file: "terminal", lines: [
      [["n", "$"], ["", " {cta.cmd}"]],
      [["c", "> {code.cta.1}"]],
      [["c", "> {code.cta.2}"]],
    ] },
  };
  const fill = (s) => s.replace(/\{([a-z0-9.]+)\}/g, (_, k) => t(k));
  const cbCode = document.getElementById("cb-code");
  const cbFile = document.getElementById("cb-file");
  const codebar = document.getElementById("codebar");
  const chapters = Array.from(document.querySelectorAll(".chapter"));
  const solids = Array.from(document.querySelectorAll(".solid, .foot"));
  const t0 = performance.now();
  let lastKey = "";

  function renderCode(id, frac) {
    const lines = CODE[id].lines.map((line) => line.map(([c, s]) => [c, fill(s)]));
    const total = lines.reduce((n, l) => n + l.reduce((m, [, s]) => m + s.length, 0), 0);
    let left = Math.round(total * Math.max(0, Math.min(1, frac)));
    const key = id + lang + left + innerWidth;
    if (key === lastKey) return;
    lastKey = key;
    cbFile.textContent = CODE[id].file;
    const out = [];
    for (const line of lines) {
      if (left <= 0 && out.length) break;
      let html = "";
      for (const [c, s] of line) {
        const part = s.slice(0, Math.max(0, left));
        left -= s.length;
        if (part) html += c ? `<span class="${c}">${esc(part)}</span>` : esc(part);
      }
      out.push(html);
    }
    out[out.length - 1] += '<span class="caret"></span>';
    const show = innerWidth < 900 ? out.slice(-3) : out;   // на телефоне — последние 3 строки, чтобы не закрывать 3D
    cbCode.innerHTML = show.join("\n");
  }
  function onScroll() {
    const vh = innerHeight, mid = scrollY + vh * 0.55;
    const overSolid = solids.some((s) => { const r = s.getBoundingClientRect(); return r.top < vh * 0.55 && r.bottom > vh * 0.55; });
    codebar.classList.toggle("off", overSolid);
    if (overSolid) return;
    let ch = chapters[0];
    for (const c of chapters) if (c.offsetTop <= mid) ch = c;
    const id = ch.dataset.code;
    let frac = (mid - ch.offsetTop) / (ch.offsetHeight * 0.75);
    if (id === "hero") frac = Math.max(frac + 0.15, reduce ? 1 : (performance.now() - t0) / 3200);
    if (reduce) frac = 1;
    renderCode(id, frac);
  }
  let ticking = false;
  const tick = () => { ticking = false; onScroll(); };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }, { passive: true });
  addEventListener("resize", () => { lastKey = ""; onScroll(); });
  (function intro() { onScroll(); if (performance.now() - t0 < 3600) requestAnimationFrame(intro); })();

  /* ---------- услуги: дерево, строка раскрывается в цены ---------- */
  const tree = document.getElementById("tree");
  let openId = "web";
  function renderTree() {
    tree.innerHTML = ORDER.map((id) => {
      const [name, desc, prices] = SVC[lang][id];
      const open = id === openId;
      const live = id === "ai" ? `<a class="link" href="https://t.me/arvisstudio_bot" target="_blank" rel="noopener">${esc(t("svc.live"))}</a><br>` : "";
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
  fetch(BASE + "portfolio/works.json", { cache: "no-cache" }).then((r) => r.json()).then((list) => {
    grid.innerHTML = list.slice(0, 3).map((w) => `<a class="work" href="${BASE}portfolio/${esc(w.url)}">
      <img src="${BASE}portfolio/shots/${esc(w.slug)}.jpg" alt="${esc(w.name)}" loading="lazy" width="1440" height="900">
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
    lastKey = "";
    onScroll();
  }
  document.querySelectorAll(".lang button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
  setLang(storedLang() || guessLang());
})();
