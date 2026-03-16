<!-- Language Links -->
<div align="center">
  <a href="#-english">🇺🇸 English</a> | 
  <a href="#-русский">🇷🇺 Русский</a> | 
  <a href="#-українська">🇺🇦 Українська</a> | 
  <a href="#-polski">🇵🇱 Polski</a>
</div>

---

<h1 align="center" id="-english">Gemma Endpoint</h1>

<p align="center">
  <em>Run Google's Gemma 3 locally. Connect any OpenAI-compatible client. Pay nothing.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?logo=node.js&style=flat-square" alt="Node.js 18+" />
  <img src="https://img.shields.io/badge/React-18+-blue?logo=react&style=flat-square" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5+-blue?logo=typescript&style=flat-square" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-Backend-lightgrey?logo=express&style=flat-square" alt="Express" />
  <img src="https://img.shields.io/badge/License-CC%20BY--NC%204.0-yellow?style=flat-square" alt="License" />
</p>

![Gemma Endpoint Dashboard](docs/screenshot.png)

---

## 📋 Table of Contents

- [What it does](#-what-it-does)
- [Features](#-features)
- [How it works](#-how-it-works)
- [Tech stack](#-tech-stack)
- [Project structure](#-project-structure)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Dashboard usage](#-dashboard-usage)
- [Connecting a client](#-connecting-a-client)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

---

## 🔍 What it does

**Gemma Endpoint** is a local proxy server that translates OpenAI-format API requests into Google Generative Language API calls, routing them to Gemma 3 models hosted on Google AI Studio. 

The result: any tool that speaks OpenAI — chatbot frontends, coding assistants, terminal scripts, automation pipelines — can use Gemma 3 for free, with your own API key, without your traffic passing through any third-party server.

Your key stays on your machine. Always.

---

## ✨ Features

| Feature | Description |
|---|---|
| **🖥️ Local Dashboard UI** | A glassmorphism-styled React interface for configuring the proxy — port, model, generation parameters — all in one place. |
| **📊 Context Estimator** | Paste your system prompt or static context and get an instant token estimate. Calculates the remaining budget for conversation history automatically. |
| **📡 Real-time Telemetry** | After each request, the dashboard displays exact token counts (prompt / completion / total) pulled live from the API response. |
| **🌐 Language Switcher** | Full UI localization: English, Russian, Ukrainian, Polish — switchable without reload. |
| **🔌 Auto Port Selection** | If the configured port is occupied, the server automatically finds the next available one. No more `EADDRINUSE` crashes. |
| **⚡ Streaming Support** | Full SSE streaming in OpenAI format. Chunks arrive in real time, `[DONE]` lands at the end — exactly as any OpenAI client expects. |
| **🎨 FX Toggle** | Animated pixel plasma background can be disabled with one click to save battery on mobile devices. |

---

### ⚠️ Important notice on content policies

This proxy sets all Google safety filters to `BLOCK_NONE` by default to prevent false-positive blocks during complex text generation tasks.

**You are routing requests through your own Google API key.** Generating content that violates Google's Terms of Service may result in your key being revoked or your account being suspended. The author of this tool assumes no responsibility for how the API is used. Monitor your usage at [Google AI Studio](https://aistudio.google.com).

---

## ⚙️ How it works

Every request goes through a translation pipeline:

```
OpenAI client (any)
        │
        │  POST /v1/chat/completions  (OpenAI format)
        ▼
┌─────────────────────────────────────────┐
│           Gemma Endpoint Proxy          │
│                                         │
│  1. translator.ts                       │
│     • Extract system messages           │
│     • Inject as user/model turn pair    │
│     • Strip unsupported params          │
│       (frequency_penalty, etc.)         │
│     • Remap max_tokens → maxOutputTokens│
│                                         │
│  2. context.ts                          │
│     • Estimate token count (÷4)         │
│     • Trim oldest messages if > 15 000  │
│     • Preserve system turn              │
│                                         │
│  3. stream.ts                           │
│     • Forward to Gemini API             │
│     • Re-wrap SSE chunks in OpenAI fmt  │
│     • Extract usageMetadata on finish   │
│     • Save telemetry to config.json     │
└─────────────────────────────────────────┘
        │
        │  SSE stream / JSON response  (OpenAI format)
        ▼
   OpenAI client receives response
```

**Why the system prompt workaround?**  
Gemma 3 via the Generative Language API does not support the `system_instruction` field. Instead, this proxy injects the system prompt as a synthetic `user` message followed by a `model: "Understood."` reply at the start of the `contents` array — making it effectively invisible to the model while still shaping its behavior.

---

## 🛠 Tech stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js 18+, Express.js, TypeScript |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **API** | Google Generative Language API (`generativelanguage.googleapis.com`) |
| **Token estimation** | `gpt-tokenizer` (client-side, browser) |
| **Build** | `tsc` (server), Vite (client) |

---

## 📁 Project structure

```text
gemma-endpoint/
├── client/                  # React/Vite frontend
│   ├── src/
│   │   ├── components/      # BentoGrid tiles: Config, Context, Status
│   │   ├── contexts/        # LanguageContext for i18n
│   │   ├── hooks/           # useHealth (polling + telemetry)
│   │   └── translations.ts  # EN / RU / UK / PL strings
│   └── package.json
├── src/                     # Express.js backend
│   ├── routes/
│   │   ├── api.ts           # /api/config, /api/health endpoints
│   │   └── completions.ts   # POST /v1/chat/completions
│   ├── translator.ts        # OpenAI ↔ Gemini format conversion
│   ├── stream.ts            # SSE streaming handler
│   ├── context.ts           # Token budget & message trimming
│   ├── config.ts            # Config file read/write manager
│   ├── types.ts             # Shared TypeScript interfaces
│   ├── app.ts               # Express app setup
│   └── server.ts            # Port selection & server start
├── docs/                    # Screenshots and assets
├── package.json             # Root scripts: build, start
├── tsconfig.json
├── start.sh                 # Linux / macOS / Termux launcher
└── start.bat                # Windows launcher
```

---

## 📦 Requirements

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Google AI Studio API key** — free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

---

## 🚀 Installation

### Windows / Linux / macOS

```bash
git clone https://github.com/itsfantomas/gemma-endpoint.git
cd gemma-endpoint
npm install
npm start
```

The browser opens automatically. If it doesn't, navigate to `http://localhost:3000`.

### Android (Termux)

```bash
pkg update && pkg upgrade
pkg install git nodejs
git clone https://github.com/itsfantomas/gemma-endpoint.git
cd gemma-endpoint
npm install
npm start
```

Then open `http://localhost:3000` in your mobile browser manually.

---

## 🖥️ Dashboard usage

1. **API Key** — paste your Google AI Studio key. It is stored locally in `config.json` and never transmitted anywhere except directly to Google.
2. **Port** — default is `3000`. Change it if needed; the server auto-selects the next free port on startup.
3. **Model** — choose between `gemma-3-27b-it`, `gemma-3-12b-it`, `gemma-3-4b-it` or `gemma-3-1b-it`.
4. **Temperature / Top P** — adjust generation parameters with the sliders.
5. **Context Estimator** — paste your system prompt, character card, or any static text. The estimator shows how many tokens it occupies and how much budget remains for conversation history.
6. **Save Configuration** — writes all settings to `config.json` on disk.

---

## 🔌 Connecting a client

Set the following in any OpenAI-compatible client:

| Field | Value |
|---|---|
| **API Endpoint / Base URL** | `http://localhost:3000/v1` |
| **API Key** | Your Google AI Studio key (`AIza...`) |
| **Context limit** | `15000` tokens |
| **Model** | `gemma-3-27b-it` (or leave blank — the proxy overrides it) |

The proxy ignores whatever model name the client sends and always uses the model configured in the dashboard.

---

## 🔧 Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| `Can't use proxy with no key defined` | API key not set or not saved | Open dashboard → enter key → click Save Configuration |
| `400 Developer instruction is not enabled` | Old proxy version with `system_instruction` | Update to latest version — system prompts are now injected as user/model turns |
| `500 Internal Server Error` from Google | Transient Google API failure | Retry the request; if persistent, check [Google AI Studio status](https://aistudio.google.com) |
| `EADDRINUSE: port already in use` | Port occupied by another process | The server auto-selects the next free port — check console output for the actual port |
| Dashboard shows `Offline` | Backend not running | Run `npm start` in the project directory |
| `completion_tokens` shows `0` | Google does not return token counts mid-stream | The proxy estimates completion tokens from response length as fallback |
| Config resets after restart | `config.json` was deleted or not saved | Always click Save Configuration after making changes |
| Termux: `npm: command not found` | Node.js not installed | Run `pkg install nodejs` first |

---

## 📄 License

**Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**  
Copyright © 2024–2026 [itsfantomas](https://github.com/itsfantomas)

You are free to share and adapt this project for **personal and educational use**.  
**Commercial use is not permitted.**  
Full license text: [creativecommons.org/licenses/by-nc/4.0](http://creativecommons.org/licenses/by-nc/4.0)

---

---

<h1 align="center" id="-русский">Gemma Endpoint</h1>

<p align="center">
  <em>Запускайте Gemma 3 локально. Подключайте любой OpenAI-совместимый клиент. Бесплатно.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?logo=node.js&style=flat-square" />
  <img src="https://img.shields.io/badge/React-18+-blue?logo=react&style=flat-square" />
  <img src="https://img.shields.io/badge/TypeScript-5+-blue?logo=typescript&style=flat-square" />
  <img src="https://img.shields.io/badge/Express-Backend-lightgrey?logo=express&style=flat-square" />
  <img src="https://img.shields.io/badge/License-CC%20BY--NC%204.0-yellow?style=flat-square" />
</p>

![Gemma Endpoint Dashboard](docs/screenshot.png)

---

## 📋 Содержание

- [Что это такое](#-что-это-такое)
- [Возможности](#-возможности)
- [Как это работает](#-как-это-работает)
- [Стек технологий](#-стек-технологий)
- [Структура проекта](#-структура-проекта)
- [Требования](#-требования)
- [Установка](#-установка)
- [Использование дашборда](#-использование-дашборда)
- [Подключение клиента](#-подключение-клиента)
- [Решение проблем](#-решение-проблем)
- [Лицензия](#-лицензия)

---

## 🔍 Что это такое

**Gemma Endpoint** — локальный прокси-сервер, который транслирует API-запросы в формате OpenAI в вызовы Google Generative Language API, перенаправляя их к моделям Gemma 3 на Google AI Studio.

Результат: любой инструмент, работающий с OpenAI — фронтенды чат-ботов, кодинг-ассистенты, терминальные скрипты, пайплайны автоматизации — получает доступ к Gemma 3 бесплатно, через ваш собственный ключ, без передачи трафика через сторонние серверы.

Ваш ключ остаётся на вашей машине. Всегда.

---

## ✨ Возможности

| Возможность | Описание |
|---|---|
| **🖥️ Локальный UI-дашборд** | React-интерфейс в стиле glassmorphism для настройки прокси: порт, модель, параметры генерации — всё в одном месте. |
| **📊 Оценка контекста** | Вставьте системный промпт или статичный контент — получите мгновенный подсчёт токенов и расчёт оставшегося бюджета для истории диалога. |
| **📡 Телеметрия в реальном времени** | После каждого запроса дашборд отображает точное количество токенов (промпт / ответ / итого) из ответа API. |
| **🌐 Переключатель языка** | Полная локализация UI: английский, русский, украинский, польский — переключение без перезагрузки. |
| **🔌 Автоматический выбор порта** | Если настроенный порт занят, сервер автоматически находит следующий свободный. |
| **⚡ Поддержка стриминга** | Полный SSE-стриминг в формате OpenAI. Чанки приходят в реальном времени, `[DONE]` в конце — именно так, как ожидает любой OpenAI-клиент. |
| **🎨 Переключатель FX** | Анимированный пиксельный фон можно отключить одним кликом для экономии батареи на мобильных устройствах. |

---

### ⚠️ Важное замечание о политике контента

По умолчанию прокси устанавливает все фильтры безопасности Google в `BLOCK_NONE`, чтобы предотвратить ложные блокировки при сложных задачах генерации текста.

**Вы маршрутизируете запросы через собственный ключ Google.** Генерация контента, нарушающего условия использования Google, может привести к отзыву ключа или блокировке аккаунта. Автор инструмента не несёт ответственности за то, как используется API. Следите за использованием на [Google AI Studio](https://aistudio.google.com).

---

## ⚙️ Как это работает

Каждый запрос проходит через пайплайн трансляции:

```
OpenAI-клиент (любой)
        │
        │  POST /v1/chat/completions  (формат OpenAI)
        ▼
┌─────────────────────────────────────────┐
│        Прокси Gemma Endpoint            │
│                                         │
│  1. translator.ts                       │
│     • Извлечение системных сообщений    │
│     • Инъекция как пара user/model      │
│     • Удаление неподдерживаемых парамов │
│     • Переименование max_tokens         │
│                                         │
│  2. context.ts                          │
│     • Оценка токенов (÷4)               │
│     • Обрезка старых сообщений > 15 000 │
│     • Сохранение системного промпта     │
│                                         │
│  3. stream.ts                           │
│     • Запрос к Gemini API               │
│     • Переупаковка SSE в формат OpenAI  │
│     • Извлечение usageMetadata          │
│     • Сохранение телеметрии в config    │
└─────────────────────────────────────────┘
        │
        │  SSE-стрим / JSON-ответ  (формат OpenAI)
        ▼
   Клиент получает ответ
```

**Почему системный промпт передаётся через user/model?**  
Gemma 3 через Generative Language API не поддерживает поле `system_instruction`. Вместо этого прокси вставляет системный промпт как синтетическое сообщение `user` с ответом `model: "Understood."` в начало массива `contents`.

---

## 🛠 Стек технологий

| Слой | Технология |
|---|---|
| **Бэкенд** | Node.js 18+, Express.js, TypeScript |
| **Фронтенд** | React 18, TypeScript, Vite, Tailwind CSS |
| **API** | Google Generative Language API |
| **Подсчёт токенов** | `gpt-tokenizer` (браузер, клиентская сторона) |
| **Сборка** | `tsc` (сервер), Vite (клиент) |

---

## 📁 Структура проекта

```text
gemma-endpoint/
├── client/                  # React/Vite фронтенд
│   ├── src/
│   │   ├── components/      # Плитки BentoGrid: Config, Context, Status
│   │   ├── contexts/        # LanguageContext для i18n
│   │   ├── hooks/           # useHealth (поллинг + телеметрия)
│   │   └── translations.ts  # Строки EN / RU / UK / PL
│   └── package.json
├── src/                     # Express.js бэкенд
│   ├── routes/
│   │   ├── api.ts           # /api/config, /api/health
│   │   └── completions.ts   # POST /v1/chat/completions
│   ├── translator.ts        # Конвертация OpenAI ↔ Gemini
│   ├── stream.ts            # Обработчик SSE-стриминга
│   ├── context.ts           # Бюджет токенов и обрезка сообщений
│   ├── config.ts            # Менеджер чтения/записи конфига
│   ├── types.ts             # TypeScript-интерфейсы
│   ├── app.ts               # Настройка Express
│   └── server.ts            # Выбор порта и запуск
├── docs/                    # Скриншоты и ресурсы
├── package.json
├── tsconfig.json
├── start.sh                 # Запуск Linux / macOS / Termux
└── start.bat                # Запуск Windows
```

---

## 📦 Требования

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **API-ключ Google AI Studio** — бесплатно на [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

---

## 🚀 Установка

### Windows / Linux / macOS

```bash
git clone https://github.com/itsfantomas/gemma-endpoint.git
cd gemma-endpoint
npm install
npm start
```

Браузер откроется автоматически. Если нет — перейдите по адресу `http://localhost:3000`.

### Android (Termux)

```bash
pkg update && pkg upgrade
pkg install git nodejs
git clone https://github.com/itsfantomas/gemma-endpoint.git
cd gemma-endpoint
npm install
npm start
```

Затем откройте `http://localhost:3000` в мобильном браузере вручную.

---

## 🖥️ Использование дашборда

1. **API Key** — вставьте ключ Google AI Studio. Он хранится локально в `config.json` и никуда не передаётся, кроме как напрямую в Google.
2. **Порт** — по умолчанию `3000`. При запуске сервер автоматически выбирает следующий свободный порт.
3. **Модель** — выбор между `gemma-3-27b-it`, `gemma-3-12b-it`, `gemma-3-4b-it` и `gemma-3-1b-it`.
4. **Temperature / Top P** — ползунки для настройки параметров генерации.
5. **Оценка контекста** — вставьте системный промпт, карточку персонажа или любой статичный текст. Оценщик покажет количество занятых токенов и оставшийся бюджет для истории диалога.
6. **Save Configuration** — записывает все настройки в `config.json` на диске.

---

## 🔌 Подключение клиента

Укажите следующие настройки в любом OpenAI-совместимом клиенте:

| Поле | Значение |
|---|---|
| **API Endpoint / Base URL** | `http://localhost:3000/v1` |
| **API Key** | Ваш ключ Google AI Studio (`AIza...`) |
| **Лимит контекста** | `15000` токенов |
| **Модель** | `gemma-3-27b-it` (или оставьте пустым — прокси подставит сам) |

Прокси игнорирует название модели, отправленное клиентом, и всегда использует модель из настроек дашборда.

---

## 🔧 Решение проблем

| Проблема | Причина | Решение |
|---|---|---|
| `Can't use proxy with no key defined` | API-ключ не задан или не сохранён | Откройте дашборд → введите ключ → нажмите Save Configuration |
| `400 Developer instruction is not enabled` | Старая версия прокси с `system_instruction` | Обновитесь до актуальной версии |
| `500 Internal Server Error` от Google | Временная ошибка Google API | Повторите запрос; при постоянных ошибках проверьте [статус Google AI Studio](https://aistudio.google.com) |
| `EADDRINUSE: port already in use` | Порт занят другим процессом | Сервер автоматически выбирает следующий свободный порт — смотрите вывод в консоли |
| Дашборд показывает `Offline` | Бэкенд не запущен | Выполните `npm start` в директории проекта |
| `completion_tokens` равно `0` | Google не возвращает счётчик токенов во время стриминга | Прокси оценивает токены ответа по длине текста как запасной вариант |
| Конфиг сбрасывается после перезапуска | `config.json` удалён или не был сохранён | Всегда нажимайте Save Configuration после изменений |
| Termux: `npm: command not found` | Node.js не установлен | Сначала выполните `pkg install nodejs` |

---

## 📄 Лицензия

**Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**  
© 2024–2026 [itsfantomas](https://github.com/itsfantomas)

Свободное использование, копирование и адаптация в **личных и образовательных целях**.  
**Коммерческое использование запрещено.**  
Полный текст лицензии: [creativecommons.org/licenses/by-nc/4.0](http://creativecommons.org/licenses/by-nc/4.0)

---

---

<h1 align="center" id="-українська">Gemma Endpoint</h1>

<p align="center">
  <em>Запускайте Gemma 3 локально. Підключайте будь-який OpenAI-сумісний клієнт. Безкоштовно.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?logo=node.js&style=flat-square" />
  <img src="https://img.shields.io/badge/React-18+-blue?logo=react&style=flat-square" />
  <img src="https://img.shields.io/badge/TypeScript-5+-blue?logo=typescript&style=flat-square" />
  <img src="https://img.shields.io/badge/Express-Backend-lightgrey?logo=express&style=flat-square" />
  <img src="https://img.shields.io/badge/License-CC%20BY--NC%204.0-yellow?style=flat-square" />
</p>

![Gemma Endpoint Dashboard](docs/screenshot.png)

---

## 📋 Зміст

- [Що це таке](#-що-це-таке)
- [Можливості](#-можливості)
- [Як це працює](#-як-це-працює)
- [Технологічний стек](#-технологічний-стек)
- [Структура проекту](#-структура-проекту)
- [Вимоги](#-вимоги)
- [Встановлення](#-встановлення)
- [Використання дашборду](#-використання-дашборду)
- [Підключення клієнта](#-підключення-клієнта)
- [Вирішення проблем](#-вирішення-проблем)
- [Ліцензія](#-ліцензія)

---

## 🔍 Що це таке

**Gemma Endpoint** — локальний проксі-сервер, який транслює API-запити у форматі OpenAI у виклики Google Generative Language API, направляючи їх до моделей Gemma 3 на Google AI Studio.

Результат: будь-який інструмент, що працює з OpenAI — фронтенди чат-ботів, кодинг-асистенти, термінальні скрипти — отримує доступ до Gemma 3 безкоштовно, через власний ключ, без передачі трафіку через сторонні сервери.

Ваш ключ залишається на вашій машині. Завжди.

---

## ✨ Можливості

| Можливість | Опис |
|---|---|
| **🖥️ Локальний UI-дашборд** | React-інтерфейс у стилі glassmorphism для налаштування проксі. |
| **📊 Оцінка контексту** | Вставте системний промпт — отримайте підрахунок токенів і залишок бюджету для діалогу. |
| **📡 Телеметрія в реальному часі** | Після кожного запиту дашборд показує точну кількість токенів з відповіді API. |
| **🌐 Перемикач мови** | Повна локалізація UI: англійська, російська, українська, польська. |
| **🔌 Автоматичний вибір порту** | Якщо порт зайнятий, сервер сам знаходить наступний вільний. |
| **⚡ Підтримка стрімінгу** | Повний SSE-стрімінг у форматі OpenAI в реальному часі. |
| **🎨 Перемикач FX** | Анімований піксельний фон можна вимкнути одним кліком для економії батареї. |

---

### ⚠️ Важливе зауваження щодо політики контенту

За замовчуванням проксі встановлює всі фільтри безпеки Google в `BLOCK_NONE`, щоб запобігти хибним блокуванням.

**Ви маршрутизуєте запити через власний ключ Google.** Генерація контенту, що порушує умови використання Google, може призвести до відкликання ключа або блокування акаунту. Автор не несе відповідальності за використання API. Слідкуйте за використанням на [Google AI Studio](https://aistudio.google.com).

---

## ⚙️ Як це працює

```
OpenAI-клієнт (будь-який)
        │
        │  POST /v1/chat/completions  (формат OpenAI)
        ▼
┌─────────────────────────────────────────┐
│        Проксі Gemma Endpoint            │
│                                         │
│  1. translator.ts                       │
│     • Витяг системних повідомлень       │
│     • Ін'єкція як пара user/model       │
│     • Видалення непідтримуваних парамів │
│     • Перейменування max_tokens         │
│                                         │
│  2. context.ts                          │
│     • Оцінка токенів (÷4)               │
│     • Обрізання старих повідомлень      │
│                                         │
│  3. stream.ts                           │
│     • Запит до Gemini API               │
│     • Переупаковка SSE у формат OpenAI  │
│     • Збереження телеметрії             │
└─────────────────────────────────────────┘
        │
        ▼
   Клієнт отримує відповідь
```

---

## 🛠 Технологічний стек

| Шар | Технологія |
|---|---|
| **Бекенд** | Node.js 18+, Express.js, TypeScript |
| **Фронтенд** | React 18, TypeScript, Vite, Tailwind CSS |
| **API** | Google Generative Language API |
| **Підрахунок токенів** | `gpt-tokenizer` (браузер) |

---

## 📁 Структура проекту

```text
gemma-endpoint/
├── client/                  # React/Vite фронтенд
│   ├── src/
│   │   ├── components/      # Плитки BentoGrid
│   │   ├── contexts/        # LanguageContext для i18n
│   │   ├── hooks/           # useHealth
│   │   └── translations.ts  # Рядки EN / RU / UK / PL
│   └── package.json
├── src/                     # Express.js бекенд
│   ├── routes/
│   │   ├── api.ts
│   │   └── completions.ts
│   ├── translator.ts
│   ├── stream.ts
│   ├── context.ts
│   ├── config.ts
│   ├── types.ts
│   ├── app.ts
│   └── server.ts
├── docs/
├── package.json
├── start.sh
└── start.bat
```

---

## 📦 Вимоги

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **API-ключ Google AI Studio** — безкоштовно на [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

---

## 🚀 Встановлення

### Windows / Linux / macOS

```bash
git clone https://github.com/itsfantomas/gemma-endpoint.git
cd gemma-endpoint
npm install
npm start
```

Браузер відкриється автоматично. Якщо ні — перейдіть на `http://localhost:3000`.

### Android (Termux)

```bash
pkg update && pkg upgrade
pkg install git nodejs
git clone https://github.com/itsfantomas/gemma-endpoint.git
cd gemma-endpoint
npm install
npm start
```

Відкрийте `http://localhost:3000` у мобільному браузері вручну.

---

## 🖥️ Використання дашборду

1. **API Key** — вставте ключ Google AI Studio. Зберігається локально у `config.json`.
2. **Порт** — за замовчуванням `3000`. Сервер автоматично обирає наступний вільний порт.
3. **Модель** — вибір між `gemma-3-27b-it`, `gemma-3-12b-it`, `gemma-3-4b-it` та `gemma-3-1b-it`.
4. **Temperature / Top P** — повзунки для налаштування генерації.
5. **Оцінка контексту** — вставте промпт або статичний текст для підрахунку токенів.
6. **Save Configuration** — записує налаштування у `config.json`.

---

## 🔌 Підключення клієнта

| Поле | Значення |
|---|---|
| **API Endpoint / Base URL** | `http://localhost:3000/v1` |
| **API Key** | Ваш ключ Google AI Studio (`AIza...`) |
| **Ліміт контексту** | `15000` токенів |

---

## 🔧 Вирішення проблем

| Проблема | Причина | Рішення |
|---|---|---|
| `Can't use proxy with no key defined` | Ключ не збережено | Відкрийте дашборд → введіть ключ → Save Configuration |
| `400 Developer instruction is not enabled` | Стара версія з `system_instruction` | Оновіться до актуальної версії |
| `500 Internal Server Error` від Google | Тимчасова помилка API | Повторіть запит |
| `EADDRINUSE` | Порт зайнятий | Сервер обирає наступний вільний — дивіться консоль |
| Дашборд показує `Offline` | Бекенд не запущено | Виконайте `npm start` |
| `completion_tokens` дорівнює `0` | Google не повертає метадані стрімінгу | Проксі оцінює токени за довжиною тексту |
| Termux: `npm: command not found` | Node.js не встановлено | `pkg install nodejs` |

---

## 📄 Ліцензія

**Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**  
© 2024–2026 [itsfantomas](https://github.com/itsfantomas)

Вільне використання та адаптація для **особистих та освітніх цілей**.  
**Комерційне використання заборонено.**  
[creativecommons.org/licenses/by-nc/4.0](http://creativecommons.org/licenses/by-nc/4.0)

---

---

<h1 align="center" id="-polski">Gemma Endpoint</h1>

<p align="center">
  <em>Uruchom Gemma 3 lokalnie. Podłącz dowolnego klienta OpenAI. Za darmo.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-green?logo=node.js&style=flat-square" />
  <img src="https://img.shields.io/badge/React-18+-blue?logo=react&style=flat-square" />
  <img src="https://img.shields.io/badge/TypeScript-5+-blue?logo=typescript&style=flat-square" />
  <img src="https://img.shields.io/badge/Express-Backend-lightgrey?logo=express&style=flat-square" />
  <img src="https://img.shields.io/badge/License-CC%20BY--NC%204.0-yellow?style=flat-square" />
</p>

![Gemma Endpoint Dashboard](docs/screenshot.png)

---

## 📋 Spis treści

- [Do czego to służy](#-do-czego-to-służy)
- [Funkcje](#-funkcje)
- [Jak to działa](#-jak-to-działa)
- [Stos technologiczny](#-stos-technologiczny)
- [Struktura projektu](#-struktura-projektu)
- [Wymagania](#-wymagania)
- [Instalacja](#-instalacja)
- [Korzystanie z panelu](#-korzystanie-z-panelu)
- [Łączenie klienta](#-łączenie-klienta)
- [Rozwiązywanie problemów](#-rozwiązywanie-problemów)
- [Licencja](#-licencja)

---

## 🔍 Do czego to służy

**Gemma Endpoint** to lokalny serwer proxy, który tłumaczy żądania API w formacie OpenAI na wywołania Google Generative Language API, kierując je do modeli Gemma 3 na Google AI Studio.

Efekt: dowolne narzędzie obsługujące OpenAI — frontendy chatbotów, asystenty kodowania, skrypty terminalowe — uzyskuje dostęp do Gemma 3 za darmo, przez własny klucz, bez przesyłania ruchu przez serwery stron trzecich.

Twój klucz pozostaje na Twoim urządzeniu. Zawsze.

---

## ✨ Funkcje

| Funkcja | Opis |
|---|---|
| **🖥️ Lokalny panel (Dashboard)** | Interfejs React w stylu glassmorphism do konfiguracji proxy. |
| **📊 Estymator kontekstu** | Wklej system prompt — uzyskaj natychmiastowy szacunek tokenów i pozostały budżet dla historii rozmowy. |
| **📡 Telemetria w czasie rzeczywistym** | Po każdym żądaniu panel wyświetla dokładne liczby tokenów z odpowiedzi API. |
| **🌐 Przełącznik języka** | Pełna lokalizacja UI: angielski, rosyjski, ukraiński, polski. |
| **🔌 Automatyczny wybór portu** | Jeśli port jest zajęty, serwer automatycznie wybiera następny wolny. |
| **⚡ Obsługa strumieniowa** | Pełny SSE streaming w formacie OpenAI w czasie rzeczywistym. |
| **🎨 Przełącznik FX** | Animowane tło pikselowe można wyłączyć jednym kliknięciem. |

---

### ⚠️ Ważna informacja o polityce treści

Proxy domyślnie ustawia wszystkie filtry bezpieczeństwa Google na `BLOCK_NONE`, aby zapobiec fałszywym blokadom.

**Kierujesz żądania przez własny klucz Google.** Generowanie treści naruszających Regulamin Google może skutkować unieważnieniem klucza lub zawieszeniem konta. Autor nie ponosi odpowiedzialności za sposób korzystania z API. Monitoruj użycie na [Google AI Studio](https://aistudio.google.com).

---

## ⚙️ Jak to działa

```
Klient OpenAI (dowolny)
        │
        │  POST /v1/chat/completions  (format OpenAI)
        ▼
┌─────────────────────────────────────────┐
│        Proxy Gemma Endpoint             │
│                                         │
│  1. translator.ts                       │
│     • Ekstrakcja wiadomości systemowych │
│     • Iniekcja jako para user/model     │
│     • Usunięcie nieobsługiwanych param. │
│     • Przemianowanie max_tokens         │
│                                         │
│  2. context.ts                          │
│     • Szacowanie tokenów (÷4)           │
│     • Przycinanie starych wiadomości    │
│                                         │
│  3. stream.ts                           │
│     • Żądanie do Gemini API             │
│     • Przepakowanie SSE na format OpenAI│
│     • Zapis telemetrii                  │
└─────────────────────────────────────────┘
        │
        ▼
   Klient otrzymuje odpowiedź
```

---

## 🛠 Stos technologiczny

| Warstwa | Technologia |
|---|---|
| **Backend** | Node.js 18+, Express.js, TypeScript |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **API** | Google Generative Language API |
| **Licznik tokenów** | `gpt-tokenizer` (przeglądarka) |

---

## 📁 Struktura projektu

```text
gemma-endpoint/
├── client/                  # Frontend React/Vite
│   ├── src/
│   │   ├── components/      # Kafelki BentoGrid
│   │   ├── contexts/        # LanguageContext dla i18n
│   │   ├── hooks/           # useHealth
│   │   └── translations.ts  # Ciągi EN / RU / UK / PL
│   └── package.json
├── src/                     # Backend Express.js
│   ├── routes/
│   │   ├── api.ts
│   │   └── completions.ts
│   ├── translator.ts
│   ├── stream.ts
│   ├── context.ts
│   ├── config.ts
│   ├── types.ts
│   ├── app.ts
│   └── server.ts
├── docs/
├── package.json
├── start.sh
└── start.bat
```

---

## 📦 Wymagania

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **Klucz API Google AI Studio** — bezpłatnie na [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

---

## 🚀 Instalacja

### Windows / Linux / macOS

```bash
git clone https://github.com/itsfantomas/gemma-endpoint.git
cd gemma-endpoint
npm install
npm start
```

Przeglądarka otworzy się automatycznie. Jeśli nie — przejdź na `http://localhost:3000`.

### Android (Termux)

```bash
pkg update && pkg upgrade
pkg install git nodejs
git clone https://github.com/itsfantomas/gemma-endpoint.git
cd gemma-endpoint
npm install
npm start
```

Otwórz `http://localhost:3000` ręcznie w przeglądarce mobilnej.

---

## 🖥️ Korzystanie z panelu

1. **API Key** — wklej klucz Google AI Studio. Przechowywany lokalnie w `config.json`.
2. **Port** — domyślnie `3000`. Serwer automatycznie wybiera następny wolny port.
3. **Model** — wybór między `gemma-3-27b-it`, `gemma-3-12b-it`, `gemma-3-4b-it` i `gemma-3-1b-it`.
4. **Temperature / Top P** — suwaki do regulacji parametrów generowania.
5. **Estymator kontekstu** — wklej prompt lub statyczny tekst do szacowania tokenów.
6. **Save Configuration** — zapisuje ustawienia do `config.json`.

---

## 🔌 Łączenie klienta

| Pole | Wartość |
|---|---|
| **API Endpoint / Base URL** | `http://localhost:3000/v1` |
| **API Key** | Twój klucz Google AI Studio (`AIza...`) |
| **Limit kontekstu** | `15000` tokenów |

---

## 🔧 Rozwiązywanie problemów

| Problem | Przyczyna | Rozwiązanie |
|---|---|---|
| `Can't use proxy with no key defined` | Klucz nie zapisany | Otwórz panel → wprowadź klucz → Save Configuration |
| `400 Developer instruction is not enabled` | Stara wersja z `system_instruction` | Zaktualizuj do najnowszej wersji |
| `500 Internal Server Error` od Google | Tymczasowy błąd API | Ponów żądanie |
| `EADDRINUSE` | Port zajęty | Serwer wybiera następny wolny — sprawdź konsolę |
| Panel pokazuje `Offline` | Backend nie uruchomiony | Wykonaj `npm start` |
| `completion_tokens` równe `0` | Google nie zwraca metadanych strumieniowania | Proxy szacuje tokeny na podstawie długości tekstu |
| Termux: `npm: command not found` | Node.js nie zainstalowany | `pkg install nodejs` |

---

## 📄 Licencja

**Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**  
© 2024–2026 [itsfantomas](https://github.com/itsfantomas)

Wolne użytkowanie i adaptacja do **celów osobistych i edukacyjnych**.  
**Użytek komercyjny jest niedozwolony.**  
[creativecommons.org/licenses/by-nc/4.0](http://creativecommons.org/licenses/by-nc/4.0)
