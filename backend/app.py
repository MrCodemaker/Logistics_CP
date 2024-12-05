from flask import Flask, request, jsonify, render_template, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import os
from datetime import timedelta
from utils import process_excel, generate_pdf  # Импортируем функции из utils.py
from routes import register_routes

# Загрузка переменных окружения
load_dotenv()

app = Flask(__name__)

# Конфигурация приложения
app.config.update(
    # База данных
    SQLALCHEMY_DATABASE_URI=os.getenv('DATABASE_URL'),
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    
    # Безопасность
    SECRET_KEY=os.getenv('SECRET_KEY'),
    JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY'),
    JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=1),
    
    # Файловая система
    UPLOAD_FOLDER=os.getenv('UPLOAD_FOLDER', 'uploads'),
    TEMPLATE_FOLDER=os.getenv('TEMPLATE_FOLDER', 'templates'),
    OUTPUT_FOLDER=os.getenv('OUTPUT_FOLDER', 'output'),
    MAX_CONTENT_LENGTH=int(os.getenv('MAX_CONTENT_LENGTH', 16777216)),
    ALLOWED_EXTENSIONS={'xlsx', 'xls'}
)

# Инициализация расширений
db = SQLAlchemy(app)
migrate = Migrate(app, db)
CORS(app)  # Включаем CORS для всех маршрутов

# Создание необходимых директорий
for folder in ['UPLOAD_FOLDER', 'TEMPLATE_FOLDER', 'OUTPUT_FOLDER']:
    os.makedirs(app.config[folder], exist_ok=True)

# Импорт моделей и маршрутов
from models import User, ProposalHistory
from routes import register_routes

# Регистрация маршрутов
register_routes(app)

# Обработчик ошибок
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()  # Откатываем сессию в случае ошибки
    return jsonify({'error': 'Internal server error'}), 500

# Проверка работоспособности API
@app.route('/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'database': check_database_connection()
    })

def check_database_connection():
    try:
        db.session.execute('SELECT 1')
        return True
    except Exception as e:
        app.logger.error(f"Database connection error: {str(e)}")
        return False

if __name__ == '__main__':
    # Создаем таблицы БД (только для разработки)
    with app.app_context():
        db.create_all()
    
    # Запускаем приложение
    debug_mode = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(
        host=os.getenv('FLASK_HOST', '0.0.0.0'),
        port=int(os.getenv('FLASK_PORT', 5000)),
        debug=debug_mode
    )