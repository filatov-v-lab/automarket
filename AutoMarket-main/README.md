# Оглавление
- [Создание таблиц (моделей) в БД](#создание-таблиц-моделей-в-бд)
- [Загрузка фикстур](#загрузка-фикстур)
---
> Все команды выполнять из корня проекта (папки с файлом manage.py).

# Содержание файла .env
    BOT_TOKEN=123456:ABCCDASasdqweADF
    CHAT_ID=123456
    DEBUG=true|false
    DB_NAME=db_name
    DB_USER=db_user
    DB_PASS=db_pass
    DB_HOST=db_host

---

# Как получить ID чата телеграм
После отправки нескольких сообщений боту, вставить ссылку ниже в браузер, предварительно заменив токен бота на действительный
- `https://api.telegram.org/bot<TOKEN_HERE>/getUpdates`
- Например, `https://api.telegram.org/bot1234:ASDFG-AFSDS2113fdsv/getUpdates`

В полученном ответе найти ключ `chat`, значение которого это объект. ID этого объекта и есть необходимый CHAT_ID
- Пример ответа: `"chat": {
"id": 456879465,
"first_name": "exemple",
"username": "exemple",
"type": "private"
},`