from flask import Flask, request, jsonify, render_template, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.utils import secure_filename
import os
from utils import process_excel, generate_pdf # Импортируем функции из utils.py

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/logistics_cp' #Настраиваем нашу БД
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'uploads' # Папка для временного хранения Excel-файлов
app_secret_key = 'your_secret_key' # Важно! Замените на случайную строку

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# ... (модели базы данных из models.py) ...

# Маршруты (routes.py)
from routes import *

if __name__ == '__main__':
    db.create_all() # Создаем таблицы БД
    app.run(debug=True) # В продакшене debug=False















