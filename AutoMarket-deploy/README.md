# AutoMarket — Интернет-магазин автозапчастей

Django-приложение. Деплой на [Render.com](https://render.com).

---

## 🚀 Как залить на Render.com (пошагово)

### 1. Залей проект на GitHub
- Создай новый репозиторий на [github.com](https://github.com)
- Загрузи все файлы этого проекта

### 2. Зарегистрируйся на Render.com
- Зайди на [render.com](https://render.com) → Sign Up (можно через GitHub)

### 3. Создай PostgreSQL базу данных
- Dashboard → **New +** → **PostgreSQL**
- Name: `automarket-db`
- Plan: **Free**
- Нажми **Create Database**
- Скопируй **Internal Database URL** (понадобится на следующем шаге)

### 4. Создай Web Service
- Dashboard → **New +** → **Web Service**
- Подключи свой GitHub репозиторий
- Заполни поля:
  - **Name**: automarket
  - **Runtime**: Python 3
  - **Build Command**: `./build.sh`
  - **Start Command**: `gunicorn store.wsgi:application`
  - **Plan**: Free

### 5. Добавь переменные окружения
В разделе **Environment** добавь:

| Key | Value |
|-----|-------|
| `SECRET_KEY` | Любая случайная строка, например: `ax7$k2m!qwe...` |
| `DEBUG` | `false` |
| `ALLOWED_HOSTS` | `твой-сайт.onrender.com` |
| `DATABASE_URL` | Internal Database URL из шага 3 |

### 6. Нажми Deploy
Render сам установит зависимости, соберёт статику и применит миграции.

### 7. Создай администратора (после деплоя)
В разделе **Shell** на Render выполни:
```
python manage.py createsuperuser
```

---

## 💻 Локальный запуск

```bash
# 1. Скопируй файл настроек
cp .env.example .env
# Отредактируй .env — поставь DEBUG=true

# 2. Установи зависимости
pip install -r requirements.txt

# 3. Примени миграции
python manage.py migrate

# 4. Создай администратора
python manage.py createsuperuser

# 5. Запусти сервер
python manage.py runserver
```

Сайт будет доступен на http://127.0.0.1:8000
Админка: http://127.0.0.1:8000/admin
