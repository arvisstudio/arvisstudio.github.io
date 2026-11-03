/* Arvis — языки, список услуг с раскрытием, сценки, пауза анимаций вне экрана. */
(function () {
  "use strict";

  const NB = " "; // неразрывный пробел: «6 000 грн» не разрывается по строкам

  /* ---------- тексты ---------- */
  const I18N = {
    uk: {
      "meta.title": "Arvis — ШІ, сайти, боти та застосунки на замовлення",
      "meta.desc": "Arvis — команда розробників і ШІ: робимо ШІ-помічників, сайти, Telegram-ботів, застосунки, ігри в Roblox, відеомонтаж, дизайн і 3D-моделі на замовлення.",
      "skip": "Перейти до змісту",
      "nav.label": "Розділи", "nav.services": "Послуги", "nav.process": "Як працюємо", "nav.contact": "Контакти",
      "cta.short": "Написати",
      "hero.lines": "Робимо сайти,|ботів і ШІ‑помічників|для вашого бізнесу",
      "hero.lead": "Люди продумують задачу й пишуть код, ШІ бере на себе рутину — тому швидко і без зайвих витрат. Ціну називаємо одразу після розмови.",
      "hero.cta": "Обговорити задачу", "hero.more": "Дивитися ціни",
      "hero.note": "Відповідаємо в Telegram. Обговорення безкоштовне.",
      "svc.title": "Що ми робимо",
      "svc.lead": "Оберіть напрям — покажемо, як це працює і скільки коштує.",
      "svc.cta": "Обговорити в Telegram",
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
      "nav.label": "Разделы", "nav.services": "Услуги", "nav.process": "Как работаем", "nav.contact": "Контакты",
      "cta.short": "Написать",
      "hero.lines": "Делаем сайты,|ботов и ИИ‑помощников|для вашего бизнеса",
      "hero.lead": "Люди продумывают задачу и пишут код, ИИ берёт на себя рутину — поэтому быстро и без лишних затрат. Цену называем сразу после разговора.",
      "hero.cta": "Обсудить задачу", "hero.more": "Смотреть цены",
      "hero.note": "Отвечаем в Telegram. Обсуждение бесплатное.",
      "svc.title": "Что мы делаем",
      "svc.lead": "Выберите направление — покажем, как это работает и сколько стоит.",
      "svc.cta": "Обсудить в Telegram",
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
      "nav.label": "Sections", "nav.services": "Services", "nav.process": "How we work", "nav.contact": "Contact",
      "cta.short": "Message us",
      "hero.lines": "We build websites,|bots and AI assistants|for your business",
      "hero.lead": "People think the task through and write the code; AI takes care of the routine — so it's fast and costs less. You get a price right after the first chat.",
      "hero.cta": "Discuss your project", "hero.more": "See prices",
      "hero.note": "We reply on Telegram. The first chat is free.",
      "svc.title": "What we do",
      "svc.lead": "Pick a service to see how it works and what it costs.",
      "svc.cta": "Discuss on Telegram",
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
        [["Сайт для кафе: меню з фото, доставка, мапа", "від 3 000 грн"], ["Лендинг", "від 4 000 грн"], ["Сайт компанії до 5 сторінок", "від 9 000 грн"], ["Інтернет-магазин", "від 20 000 грн"]]],
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
        [["Сайт для кафе: меню с фото, доставка, карта", "от 3 000 грн"], ["Лендинг", "от 4 000 грн"], ["Сайт компании до 5 страниц", "от 9 000 грн"], ["Интернет-магазин", "от 20 000 грн"]]],
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
        [["Café website: menu with photos, delivery, map", "from 3,000 UAH"], ["Landing page", "from 4,000 UAH"], ["Company website, up to 5 pages", "from 9,000 UAH"], ["Online store", "from 20,000 UAH"]]],
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
  const FROM = { ai: 4000, web: 3000, tg: 2500, app: 8000, game: 2000, video: 300, design: 200, "3d": 600 };
  const ORDER = Object.keys(FROM);

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let lang = "uk";
  let current = "ai";        // открытая строка; null — все свёрнуты
  let servicesVisible = false;

  const money = (n) => lang === "en" ? n.toLocaleString("en-US") : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB);

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
    document.querySelectorAll("[data-i18n]").forEach((el) => { const t = dict[el.dataset.i18n]; if (t) el.textContent = t; });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => { const t = dict[el.dataset.i18nAria]; if (t) el.setAttribute("aria-label", t); });
    // заголовок лесенкой: строки через «|», каждая в своём окошке
    document.querySelectorAll("[data-i18n-lines]").forEach((el) => {
      const lines = dict[el.dataset.i18nLines].split("|");
      el.querySelectorAll(".ln > span").forEach((s, i) => { s.textContent = lines[i] || ""; });
    });
    document.title = dict["meta.title"];
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", dict["meta.desc"]);
    document.querySelectorAll(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    try { localStorage.setItem("arvis-lang", lang); } catch (e) { /* без памяти — не страшно */ }
    rows.forEach((row) => {
      const id = row.dataset.svc;
      row.querySelector(".svc-name").textContent = SVC[lang][id][0];
      row.querySelector(".svc-from").textContent = dict["svc.from"].replace("{n}", money(FROM[id]));
    });
    if (current) renderService(current, false);
    renderCaption();
    if (servicesVisible && current) runScene(current);   // тексты в сценке поменялись — начинаем её заново
  }

  /* ---------- список услуг: одна строка открыта, в неё переезжает блок с ценами и сценкой ---------- */
  const rows = Array.from(document.querySelectorAll(".svc"));
  const detail = document.getElementById("detail");
  function renderService(id, animate) {
    const [, desc, prices] = SVC[lang][id];
    document.getElementById("svc-desc").textContent = desc;
    const ul = document.getElementById("svc-prices");
    ul.textContent = "";
    prices.forEach(([n, price]) => {
      const li = document.createElement("li");
      const s = document.createElement("span"); s.textContent = n;
      const b = document.createElement("b"); b.textContent = p(price);
      li.append(s, b); ul.append(li);
    });
    if (animate && !reduce) { detail.classList.remove("swap"); void detail.offsetWidth; detail.classList.add("swap"); }
  }
  function openRow(id) {
    current = id;
    rows.forEach((row) => {
      const on = row.dataset.svc === id;
      row.querySelector(".svc-btn").setAttribute("aria-expanded", String(on));
      const panel = row.querySelector(".svc-panel");
      panel.hidden = !on;
      if (on) panel.append(detail);
    });
    if (!id) { stopScene(); return; }
    renderService(id, true);
    document.querySelectorAll(".scene").forEach((s) => s.classList.toggle("on", s.dataset.scene === id));
    if (servicesVisible) runScene(id); else stopScene();
  }
  rows.forEach((row) => {
    const btn = row.querySelector(".svc-btn");
    btn.addEventListener("click", () => {
      // строка выше свернётся — держим нажатую кнопку на том же месте экрана
      const before = btn.getBoundingClientRect().top;
      openRow(current === row.dataset.svc ? null : row.dataset.svc);
      const shift = btn.getBoundingClientRect().top - before;
      if (shift) window.scrollBy({ top: shift, behavior: "instant" });
    });
  });

  /* ---------- сценки: шаги по времени (data-at / data-out, цикл data-loop) ---------- */
  let activeScene = null, timer = null, t0 = 0;
  function stopScene() { clearInterval(timer); timer = null; if (activeScene) activeScene.classList.add("paused"); }
  function runScene(id) {
    clearInterval(timer);
    const el = document.querySelector(`.scene[data-scene="${id}"]`);
    if (!el) return;
    activeScene = el;
    el.classList.remove("paused", "fade");
    const steps = Array.from(el.querySelectorAll("[data-at]"));
    if (reduce) { steps.forEach((s) => s.classList.toggle("in", !s.dataset.out)); return; }
    const loop = Number(el.dataset.loop) || 8;
    t0 = performance.now();
    const tick = () => {
      const t = (performance.now() - t0) / 1000;
      if (t >= loop) { t0 = performance.now(); el.classList.remove("fade"); steps.forEach((s) => s.classList.remove("in")); return; }
      el.classList.toggle("fade", t > loop - 0.5);
      steps.forEach((s) => {
        const at = Number(s.dataset.at), out = s.dataset.out ? Number(s.dataset.out) : Infinity;
        s.classList.toggle("in", t >= at && t < out);
      });
    };
    steps.forEach((s) => s.classList.remove("in"));
    tick();
    timer = setInterval(tick, 80);
  }

  /* ---------- субтитры и звуковая дорожка в «Відео» ---------- */
  function renderCaption() {
    const cap = document.getElementById("caption");
    cap.textContent = "";
    I18N[lang].caption.split(" ").forEach((w, i, all) => {
      const s = document.createElement("span");
      s.className = "w"; s.dataset.at = (0.5 + i * 0.45).toFixed(2);
      s.textContent = w;
      cap.append(s, i < all.length - 1 ? " " : "");
    });
  }
  (function wave() {
    const box = document.querySelector(".wave");
    let seed = 5;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 56; i++) {
      const b = document.createElement("i");
      b.style.setProperty("--h", Math.round(20 + 80 * Math.abs(Math.sin(i * 0.55)) * (0.5 + rnd() * 0.5)) + "%");
      box.append(b);
    }
  })();

  /* ---------- «Ігри»: уровень из кубиков в изометрии, оттенки серого с чёрным контуром ---------- */
  (function buildLevel() {
    const svg = document.getElementById("iso");
    const NS = "http://www.w3.org/2000/svg";
    const s = 36, a = s * 0.866, b = s * 0.5, ox = 180, oy = 96;
    const el = (tag, attrs, parent) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); parent.append(n); return n; };
    const pt = (gx, gy, gz) => [ox + (gx - gy) * a, oy + (gx + gy) * b - gz * s];
    const TONE = {
      ground: ["#FFFFFF", "#D4D4D4", "#9A9A9A"],
      dark: ["#7A7A7A", "#3D3D3D", "#000000"],
      light: ["#EDEDED", "#BDBDBD", "#7A7A7A"],
    };
    const blocks = [];
    for (let gx = 0; gx < 3; gx++) for (let gy = 0; gy < 3; gy++) blocks.push([gx, gy, 0, "ground"]);
    blocks.push([0, 0, 1, "dark"], [0, 0, 2, "dark"], [0, 1, 1, "light"], [2, 0, 1, "light"]);
    blocks.sort((p1, p2) => (p1[0] + p1[1]) - (p2[0] + p2[1]) || p1[2] - p2[2]);
    blocks.forEach(([gx, gy, gz, c], i) => {
      const [x, y] = pt(gx, gy, gz);
      const [top, left, right] = TONE[c];
      const g = el("g", { class: "blk step", "data-at": (gz === 0 ? 0.2 + i * 0.12 : 1.5 + gz * 0.25 + i * 0.03).toFixed(2) }, svg);
      el("polygon", { points: `${x},${y} ${x + a},${y + b} ${x},${y + 2 * b} ${x - a},${y + b}`, fill: top }, g);
      el("polygon", { points: `${x - a},${y + b} ${x},${y + 2 * b} ${x},${y + 2 * b + s} ${x - a},${y + b + s}`, fill: left }, g);
      el("polygon", { points: `${x},${y + 2 * b} ${x + a},${y + b} ${x + a},${y + b + s} ${x},${y + 2 * b + s}`, fill: right }, g);
    });
    const [cx, cy] = pt(1, 1, 0);
    const feet = cy + b;
    const bot = el("g", { class: "bot step", "data-at": "2.5" }, svg);
    const body = el("g", {}, bot);
    el("rect", { x: cx - 9, y: feet - 20, width: 8, height: 20, rx: 2, fill: "#000" }, body);
    el("rect", { x: cx + 1, y: feet - 20, width: 8, height: 20, rx: 2, fill: "#000" }, body);
    el("rect", { x: cx - 12, y: feet - 42, width: 24, height: 23, rx: 4, fill: "#000" }, body);
    el("rect", { x: cx - 18, y: feet - 41, width: 6, height: 19, rx: 3, fill: "#fff" }, body);
    el("rect", { x: cx + 12, y: feet - 41, width: 6, height: 19, rx: 3, fill: "#fff" }, body);
    el("rect", { x: cx - 10, y: feet - 62, width: 20, height: 19, rx: 5, fill: "#fff" }, body);
    el("circle", { cx: cx - 4, cy: feet - 54, r: 1.4, fill: "#000" }, body);
    el("circle", { cx: cx + 4, cy: feet - 54, r: 1.4, fill: "#000" }, body);
    el("path", { d: `M${cx - 4} ${feet - 49} q4 3 8 0`, stroke: "#000", "stroke-width": 1.6, fill: "none", "stroke-linecap": "round" }, body);
    const [kx, ky] = pt(2, 0, 1);
    const coin = el("g", { class: "coin step", "data-at": "3.2" }, svg);
    const cg = el("g", {}, coin);
    el("circle", { cx: kx, cy: ky - 18, r: 11, fill: "#fff", "stroke-width": 3 }, cg);
    el("path", { d: `M${kx} ${ky - 24} v12`, stroke: "#000", "stroke-width": 3, "stroke-linecap": "round" }, cg);
    const plus = el("text", { class: "coin-pop step", "data-at": "3.6", x: kx + 14, y: ky - 34 }, svg);
    plus.textContent = "+10";
  })();

  /* ---------- заставка: логотип увеличен в центре экрана, потом улетает на своё место в шапке ---------- */
  const root = document.documentElement;
  // слабое устройство или экономия трафика — без постоянного движения (зерно и электроны стоят на месте)
  const conn = navigator.connection;
  if ((conn && conn.saveData) || navigator.deviceMemory <= 2 || navigator.hardwareConcurrency <= 2) root.classList.add("lite");
  if (root.classList.contains("intro")) {
    if (window.scrollY > 80) root.classList.remove("intro");   // страницу открыли не с начала — заставка не нужна
    const brand = document.querySelector(".brand-top");
    const start = () => {
      if (!root.classList.contains("intro") || root.classList.contains("go")) return;  // запасной таймер успел раньше
      const r = brand.getBoundingClientRect();
      brand.style.setProperty("--bx", (innerWidth / 2 - (r.left + r.width / 2)).toFixed(1) + "px");
      brand.style.setProperty("--by", (innerHeight / 2 - (r.top + r.height / 2)).toFixed(1) + "px");
      brand.style.setProperty("--bs", Math.min(3.4, (innerWidth * 0.62) / r.width).toFixed(3));
      root.classList.add("go");
      // ?t=1500 — стоп-кадр заставки на 1.5 с: так проверяю кадры, на обычных посетителей не влияет
      const t = new URLSearchParams(location.search).get("t");
      if (t !== null) {
        getComputedStyle(brand).transform;   // пересчитать стили сразу, чтобы анимации уже существовали
        document.getAnimations().forEach((a) => { a.pause(); a.currentTime = Number(t); });
      }
    };
    // ждём шрифты, чтобы буквы «arvis» не прыгнули посреди анимации, но не дольше 0.7 с
    Promise.race([document.fonts ? document.fonts.ready : null, new Promise((r) => setTimeout(r, 700))]).then(start);
  }

  /* ---------- что видно на экране: запускаем и ставим на паузу ---------- */
  const hero = document.querySelector(".hero");
  const services = document.getElementById("services");
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => hero.classList.toggle("paused", !e.isIntersecting)).observe(hero);
    new IntersectionObserver(([e]) => {
      servicesVisible = e.isIntersecting;
      if (servicesVisible && current) runScene(current); else stopScene();
    }, { threshold: 0.1 }).observe(services);
  } else {
    servicesVisible = true; runScene(current);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopScene(); else if (servicesVisible && current) runScene(current);
  });

  document.querySelectorAll(".lang button").forEach((btn) => btn.addEventListener("click", () => setLang(btn.dataset.lang)));
  setLang(storedLang() || guessLang());

  // прямая ссылка на услугу: …/#web, …/#ai, …/#3d — открывает нужную строку
  function openFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!ORDER.includes(id)) return;
    openRow(id);
    document.getElementById("btn-" + id).scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
  window.addEventListener("hashchange", openFromHash);
  openFromHash();
})();
