import os
import requests
from datetime import datetime

BOT_TOKEN = os.getenv("BOT_TOKEN", "8916954883:AAHZoGA8i2367ZdnJ0zOGXNS0svjgKWAiwE")
CHAT_ID = os.getenv("CHAT_ID", "8870678654")

# Твое расписание и домашка по дням недели (или конкретным датам)
HOMEWORK_SCHEDULE = {
    "Monday": {
        "lessons": ["Математика", "Физика", "Программирование"],
        "homework": "Сделать практическую работу по Python и выучить формулы."
    },
    "Tuesday": {
        "lessons": ["Инженерная графика", "Базы данных"],
        "homework": "Доделать чертеж в КОМПАС-3D и подготовить запросы SQL."
    },
    # Можешь добавлять остальные дни недели...
}

def send_morning_homework():
    """Функция, которая проверяет расписание на сегодняшний день и шлет в бот"""
    # Определяем текущий день недели на английском (Monday, Tuesday и т.д.)
    current_day = datetime.now().strftime("%A")
    
    # Если на сегодня есть запись в расписании
    if current_day in HOMEWORK_SCHEDULE:
        day_info = HOMEWORK_SCHEDULE[current_day]
        lessons_list = ", ".join(day_info["lessons"])
        
        message = (
            f"☀️ **Доброе утро! Напоминание по учебе на сегодня:**\n\n"
            f"📚 **Предметы:** {lessons_list}\n"
            f"✍️ **Домашнее задание:**\n{day_info['homework']}"
        )
    else:
        message = "☀️ **Доброе утро!** Сегодня пар по расписанию нет, отдыхай! 🎉"

    # Отправка сообщения в Telegram
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": CHAT_ID,
        "text": message,
        "parse_mode": "Markdown"
    }
    
    response = requests.post(url, json=payload)
    return response.json()
