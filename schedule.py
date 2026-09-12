import os
from datetime import datetime, timedelta
from fastapi import FastAPI, Form, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

# Настройка CORS, чтобы сайт мог стучаться к бэкенду
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BOT_TOKEN = os.getenv("BOT_TOKEN", "8916954883:AAHZoGA8i2367ZdnJ0zOGXNS0svjgKWAiwE")
CHAT_ID = os.getenv("CHAT_ID", "8870678654")

# Расписание и ДЗ
HOMEWORK_SCHEDULE = {
    "Monday": {
        "title": "Понедельник",
        "lessons": ["Математика", "Физика", "Программирование"],
        "homework": "Сделать практическую работу по Python и выучить формулы."
    },
    "Tuesday": {
        "title": "Вторник",
        "lessons": ["Инженерная графика", "Базы данных"],
        "homework": "Доделать чертеж в КОМПАС-3D и подготовить запросы SQL."
    },
    "Wednesday": {
        "title": "Среда",
        "lessons": ["Электротехника", "История"],
        "homework": "Подготовить конспект по лекции и решить задачи."
    },
    "Thursday": {
        "title": "Четверг",
        "lessons": ["Веб-разработка", "Сети"],
        "homework": "Доделать верстку сайта и изучить маршрутизацию."
    },
    "Friday": {
        "title": "Пятница",
        "lessons": ["Физкультура", "Английский"],
        "homework": "Выучить новые технические термины."
    }
}

@app.post("/api/send-bookmark")
async def send_bookmark(
    date: str = Form(...),
    time: str = Form(...),
    send_date: str = Form(...),
    priority: str = Form(...),
    text: str = Form(...),
    file: UploadFile = File(None)
):
    """Эндпоинт для приема закладок/заметок с сайта и отправки в Telegram"""
    
    priority_emoji = {
        "high": "🔴 Высокий",
        "medium": "🟠 Средний",
        "low": "🟢 Низкий"
    }.get(priority, "⚪️")

    message = (
        f"📌 **Новая закладка / Заметка**\n\n"
        f"📅 **Дата события:** {date}\n"
        f"⏰ **Время:** {time}\n"
        f"📬 **Дата отправки:** {send_date}\n"
        f"⚡ **Приоритет:** {priority_emoji}\n\n"
        f"💬 **Текст:**\n{text}"
    )

    try:
        if file:
            file_bytes = await file.read()
            files = {"document": (file.filename, file_bytes)}
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendDocument"
            data = {"chat_id": CHAT_ID, "caption": message, "parse_mode": "Markdown"}
            response = requests.post(url, data=data, files=files)
        else:
            url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
            payload = {"chat_id": CHAT_ID, "text": message, "parse_mode": "Markdown"}
            response = requests.post(url, json=payload)

        if not response.ok:
            raise HTTPException(status_code=500, detail="Ошибка при отправке в Telegram API")

        return {"status": "success", "message": "Успешно отправлено в бота!"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/send-tomorrow-homework")
def send_tomorrow_homework():
    """Эндпоинт для автоматической рассылки домашки НА ЗАВТРА (вызывается планировщиком)"""
    tomorrow = datetime.now() + timedelta(days=1)
    tomorrow_day_str = tomorrow.strftime("%A")
    
    if tomorrow_day_str in HOMEWORK_SCHEDULE:
        day_info = HOMEWORK_SCHEDULE[tomorrow_day_str]
        lessons_list = ", ".join(day_info["lessons"])
        
        message = (
            f"📚 **Напоминание по ДЗ на завтра ({day_info['title']} - {tomorrow.strftime('%d.%m')}):**\n\n"
            f"🎓 **Предметы:** {lessons_list}\n"
            f"✍️ **Задание:**\n{day_info['homework']}"
        )
    else:
        message = f"📚 **На завтра ({tomorrow.strftime('%d.%m')}) пар по расписанию нет!** Можно отдохнуть 🎉"

    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": CHAT_ID,
        "text": message,
        "parse_mode": "Markdown"
    }
    
    response = requests.post(url, json=payload)
    if response.ok:
        return {"status": "success", "message": "Домашка на завтра успешно отправлена!"}
    else:
        raise HTTPException(status_code=500, detail="Не удалось отправить уведомление.")
