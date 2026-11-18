const englishToRussian = {
  'Skip to content': 'Перейти к содержимому', 'Home': 'Главная', 'Models': 'Модели', 'About': 'О платформе', 'Early access': 'Ранний доступ', 'Less complexity. More possibilities for AI.': 'Меньше сложности. Больше возможностей для AI.', 'About data storage': 'О хранении данных', 'Navigation': 'Навигация', 'Contacts': 'Контакты', 'Your data in Relay': 'Ваши данные в Relay', 'Tags': 'Теги',
  'Scroll horizontally to view all models.': 'Прокрутите таблицу по горизонтали, чтобы увидеть все модели.',
  'Account': 'Аккаунт', 'Language': 'Язык', 'Theme': 'Тема', 'Dark theme': 'Темная тема', 'Light theme': 'Светлая тема',
  'Switch to dark theme': 'Включить темную тему', 'Switch to light theme': 'Включить светлую тему',
  'Open menu': 'Открыть меню', 'Close menu': 'Закрыть меню', 'Back to top': 'Вернуться наверх', 'Close notification': 'Закрыть уведомление',
  'Request example copied.': 'Пример запроса скопирован.', 'Copying is unavailable. The text is selected for manual copying.': 'Копирование недоступно. Текст выделен: скопируйте его вручную.',
  'requests for the period': 'запросов за период', 'Enter valid parameters to calculate.': 'Заполните корректные параметры для расчёта.', 'tokens of context': 'токенов контекста', 'For pilot': 'Для пилота', 'Select for application': 'Выбрать для заявки',
  'Local account': 'Локальный аккаунт', 'Name': 'Имя', 'Email': 'Email', 'Password': 'Пароль', 'Sign in': 'Войти', 'Create account': 'Создать аккаунт', 'Sign out': 'Выйти', 'Register': 'Зарегистрироваться', 'Already have an account?': 'Уже есть аккаунт?', 'New here?': 'Впервые здесь?', 'Your favorites': 'Избранные модели', 'No favorites yet.': 'Пока нет избранных моделей.', 'Browse models': 'Посмотреть модели',
  'Accounts and favorites are stored only in this browser. Clearing site data removes them.': 'Аккаунты и избранное хранятся только в этом браузере. Очистка данных сайта удалит их.',
  'This local account does not protect data from other people using this browser. The existing early access application is shared in this browser and is not private to an account.': 'Локальный аккаунт не защищает данные от других пользователей этого браузера. Существующая заявка на ранний доступ общая для браузера и не является личной для аккаунта.',
  'Passwords are stored as salted hashes, not copied to the application.': 'Пароли хранятся в виде хешей с солью и не копируются в заявку.',
  'Enter a name, a valid email and a password of at least 8 characters.': 'Укажите имя, корректный email и пароль не менее 8 символов.', 'An account with this email already exists.': 'Аккаунт с таким email уже существует.', 'Incorrect email or password.': 'Неверный email или пароль.', 'Local storage is unavailable.': 'Локальное хранилище недоступно.',
  'Sign in to save favorites': 'Войдите, чтобы сохранять избранное', 'Add to favorites': 'Добавить в избранное', 'Remove from favorites': 'Удалить из избранного', 'Compare': 'Сравнить', 'Remove from comparison': 'Удалить из сравнения', 'Compare models': 'Сравнить модели', 'Clear comparison': 'Очистить сравнение', 'Close': 'Закрыть', 'Comparison': 'Сравнение', 'Choose up to 3 models.': 'Выберите до 3 моделей.', 'Model': 'Модель', 'Creator': 'Автор', 'Task': 'Задача', 'Author context': 'Контекст по данным автора', 'License': 'Лицензия', 'Description': 'Описание', 'Source': 'Источник', 'Tokens': 'Токены', 'Pilot plan': 'План пилота', 'Details': 'Подробнее', 'Choose': 'Выбрать', 'Models found: {count}': 'Найдено моделей: {count}',
  'Connection and parameters depend on deployment conditions.': 'Подключение и параметры зависят от условий развёртывания.', 'Identifier': 'Идентификатор', 'A long context may require additional configuration. See the author page for limitations and license.': 'Длинный контекст может потребовать дополнительной настройки. Ограничения и лицензию смотрите на странице автора.', 'Author page': 'Карточка автора', 'Select at least one model to compare.': 'Выберите хотя бы одну модель для сравнения.', 'Favorites could not be updated.': 'Не удалось обновить избранное.',
};

const russianToEnglish = {
  'Укажите целое неотрицательное число.': 'Enter a non-negative integer.',
  'Укажите ненулевой объём входных или выходных токенов.': 'Enter a non-zero number of input or output tokens.',
  'Проверьте параметры нагрузки.': 'Check the usage parameters.',
  'Запросы в день: допустимо от 1 до 1000000.': 'Requests per day: enter a value from 1 to 1000000.',
  'Входные токены: допустимо от 0 до 10000000.': 'Input tokens: enter a value from 0 to 10000000.',
  'Выходные токены: допустимо от 0 до 10000000.': 'Output tokens: enter a value from 0 to 10000000.',
  'Дни работы: допустимо от 1 до 31.': 'Working days: enter a value from 1 to 31.',
  'Диалоги': 'Chat', 'Код': 'Code', 'Рассуждения': 'Reasoning', 'Изображения': 'Images', 'Поиск': 'Search', 'Текст': 'Text', 'Мультиязычность': 'Multilingual', 'Математика': 'Mathematics', 'Документы': 'Documents', 'Видео': 'Video', 'Семантический поиск': 'Semantic search',
  'Инструкционная языковая модель для диалогов, работы с текстом и структурированными данными.': 'An instruction-tuned language model for conversations, text and structured data.',
  'Инструкционная модель для генерации, анализа и исправления кода.': 'An instruction-tuned model for generating, analyzing and fixing code.',
  'Модель на основе Qwen, дообученная на данных рассуждений DeepSeek R1.': 'A Qwen-based model fine-tuned on DeepSeek R1 reasoning data.',
  'Мультимодальная модель для работы с изображениями, текстом и видео.': 'A multimodal model for images, text and video.',
  'Модель текстовых embeddings для семантического поиска и сопоставления текстов.': 'A text embedding model for semantic search and text matching.',
  'Инструкционная модель семейства Qwen2.5 Coder для работы с кодом.': 'An instruction-tuned model from the Qwen2.5 Coder family for working with code.',
  'ДИАЛОГИ': 'CHAT', 'КОД': 'CODE', 'РАССУЖДЕНИЯ': 'REASONING',
  'Помощник, который знает вашу задачу': 'An assistant that understands your task',
  'Ответы на вопросы, объяснение возможностей продукта и работа с текстом. Начните с диалоговой модели и короткого понятного запроса.': 'Answer questions, explain product features and work with text. Start with a chat model and a short, clear prompt.',
  'Объясни новому пользователю, как создать первый проект. Ответь в трёх коротких шагах.': 'Explain to a new user how to create their first project. Answer in three short steps.',
  'От понятного вопроса к понятному коду': 'From a clear question to clear code',
  'Разбор функций, объяснение ошибок и подготовка примеров. Модель помогает в работе, но результат по-прежнему требует проверки разработчиком.': 'Analyze functions, explain errors and prepare examples. The model assists your work, but a developer still needs to check the result.',
  'Покажи пример debounce-функции на JavaScript и объясни, когда она полезна.': 'Show an example of a JavaScript debounce function and explain when it is useful.',
  'Разобрать задачу, прежде чем отвечать': 'Understand the problem before answering',
  'Сравнение вариантов и последовательный разбор сложных вопросов. Важные выводы нужно проверять по фактам и требованиям вашего продукта.': 'Compare options and examine complex questions step by step. Check important conclusions against facts and your product requirements.',
  'Сравни очереди и синхронные HTTP-запросы для обработки изображений. Учитывай задержки и повторную обработку.': 'Compare queues and synchronous HTTP requests for image processing. Consider latency and retries.',
  'Укажите имя, не более 120 символов.': 'Enter a name of no more than 120 characters.',
  'Укажите корректный email.': 'Enter a valid email address.',
  'Не более 120 символов.': 'Use no more than 120 characters.',
  'Опишите сценарий, не более 200 символов.': 'Describe the use case in no more than 200 characters.',
  'Выберите модель из списка.': 'Choose a model from the list.',
  'Выберите предполагаемый объём.': 'Choose the estimated volume.',
  'Не более 2000 символов.': 'Use no more than 2000 characters.',
  'Подтвердите согласие на сохранение на устройстве.': 'Confirm that you agree to save the data on this device.',
  'Номер заявки': 'Application ID', 'Создана': 'Created', 'Обновлена': 'Updated', 'Имя': 'Name',
  'Компания или проект': 'Company or project', 'Не указаны': 'Not specified', 'Сценарий использования': 'Use case',
  'Модель для пилота': 'Pilot model', 'Пока не определились': 'Not decided yet', 'Токенов в месяц': 'Tokens per month',
  'Дополнительные детали': 'Additional details', 'Согласие на локальное сохранение': 'Consent to local storage', 'Да': 'Yes', 'Нет': 'No',
  'Пока не знаю': 'Not sure yet', 'До 1 млн': 'Under 1 million', '1–10 млн': '1–10 million', 'Более 10 млн': 'Over 10 million',
  'Проверяем сохранённую заявку…': 'Checking for a saved application…',
  'Найдена сохранённая заявка. Введённые данные остались в форме; сохраните их или отмените изменения.': 'A saved application was found. Your entries remain in the form; save them or cancel your changes.',
  'Заявка сохранена только в этом браузере и не отправлена.': 'The application is saved only in this browser and has not been sent.',
  'Заполните форму, чтобы сохранить заявку на устройстве.': 'Complete the form to save your application on this device.',
  'Проверьте отмеченные поля.': 'Check the highlighted fields.',
  'Сохраняем заявку на устройстве…': 'Saving the application on this device…',
  'Измените данные и сохраните заявку повторно.': 'Change the details and save the application again.',
  'Изменения отменены. Сохранённая заявка не изменилась.': 'Changes canceled. The saved application has not changed.',
  'Удаляем заявку с устройства…': 'Deleting the application from this device…',
  'Заявка удалена из этого браузера.': 'The application was deleted from this browser.',
  'Недостаточно места в хранилище браузера. Освободите место и повторите попытку.': 'Not enough browser storage space. Free up space and try again.',
  'Хранилище недоступно или операция не выполнена. Проверьте настройки браузера и повторите попытку.': 'Storage is unavailable or the operation failed. Check your browser settings and try again.',
  'IndexedDB недоступна в этом браузере.': 'IndexedDB is unavailable in this browser.',
  'Хранилище заблокировано другой вкладкой. Закройте её и повторите попытку.': 'Storage is blocked by another tab. Close it and try again.',
  'Заявка не загружена.': 'The application was not loaded.', 'Введённые данные сохранены в форме.': 'Your entries remain in the form.',
  'Заявка не удалена.': 'The application was not deleted.', 'Повторить': 'Retry',
};

let language = 'ru';
try { if (localStorage.getItem('relay-language') === 'en') language = 'en'; } catch {}
document.documentElement.lang = language;

export function getLanguage() { return language; }
export function t(key, params = {}) {
  const value = language === 'en' ? (russianToEnglish[key] ?? key) : (englishToRussian[key] ?? key);
  return String(value).replace(/\{(\w+)\}/g, (match, name) => Object.hasOwn(params, name) ? String(params[name]) : match);
}
const originals = new WeakMap();
export function translatePage(root = document) {
  const selector = '[data-en], [data-en-aria-label], [data-en-placeholder], [data-en-title], [data-en-content], [data-i18n], [data-i18n-aria-label], [data-i18n-placeholder], [data-i18n-title], [data-i18n-content]';
  const nodes = [...root.querySelectorAll(selector)];
  if (root.matches?.(selector)) nodes.unshift(root);
  nodes.forEach(node => {
    let original = originals.get(node);
    if (!original) { original = {}; originals.set(node, original); }
    if (node.hasAttribute('data-en')) {
      if (!Object.hasOwn(original, 'text')) original.text = node.textContent;
      node.textContent = language === 'en' ? node.dataset.en : original.text;
    } else if (node.dataset.i18n) node.textContent = t(node.dataset.i18n);
    for (const attribute of ['aria-label', 'placeholder', 'title', 'content']) {
      const english = node.getAttribute(`data-en-${attribute}`);
      if (english !== null) {
        if (!Object.hasOwn(original, attribute)) original[attribute] = node.getAttribute(attribute);
        node.setAttribute(attribute, language === 'en' ? english : original[attribute]);
      } else {
        const key = node.getAttribute(`data-i18n-${attribute}`);
        if (key) node.setAttribute(attribute, t(key));
      }
    }
  });
  document.documentElement.lang = language;
}
export function setLanguage(lang) {
  if (!['ru', 'en'].includes(lang) || language === lang) return;
  language = lang;
  try { localStorage.setItem('relay-language', lang); } catch {}
  translatePage();
  window.dispatchEvent(new CustomEvent('relay:language', { detail: { language: lang } }));
}
