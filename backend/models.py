from app import db
from datetime import datetime, timedelta
import jwt
from flask import current_app
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import event

class User(db.Model):
    """Модель пользователя системы"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)  # Увеличен размер для хэша
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    role = db.Column(db.String(20), default='user')  # Роль пользователя

    def set_password(self, password):
        """Установка хэшированного пароля"""
        self.password = generate_password_hash(password, method='pbkdf2:sha256')

    def check_password(self, password):
        """Проверка пароля"""
        return check_password_hash(self.password, password)

    def generate_token(self):
        """Генерация JWT токена"""
        payload = {
            'user_id': self.id,
            'username': self.username,
            'role': self.role,
            'exp': datetime.utcnow() + timedelta(hours=1)
        }
        return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'])

    def to_dict(self):
        """Сериализация пользователя для API"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat(),
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active
        }

    def __repr__(self):
        return f'<User {self.username}>'

class ProposalHistory(db.Model):
    """Модель для хранения истории коммерческих предложений"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = db.Column(db.String(50), default='created')
    data = db.Column(db.JSON)
    file_path = db.Column(db.String(500))
    file_size = db.Column(db.Integer)  # Размер файла в байтах
    mime_type = db.Column(db.String(100))  # MIME-тип файла
    processing_time = db.Column(db.Float)  # Время обработки в секундах

    # Связи
    user = db.relationship(
        'User',
        backref=db.backref('proposals', lazy='dynamic', cascade='all, delete-orphan')
    )

    # Статусы предложения
    STATUS_CREATED = 'created'
    STATUS_PROCESSING = 'processing'
    STATUS_COMPLETED = 'completed'
    STATUS_ERROR = 'error'

    @hybrid_property
    def is_completed(self):
        """Проверка завершенности обработки"""
        return self.status == self.STATUS_COMPLETED

    def __init__(self, user_id, filename, original_filename, data=None):
        self.user_id = user_id
        self.filename = filename
        self.original_filename = original_filename
        self.data = data or {}
        self.status = self.STATUS_CREATED

    def update_status(self, new_status, commit=True):
        """Обновление статуса предложения"""
        if new_status not in [self.STATUS_CREATED, self.STATUS_PROCESSING, 
                            self.STATUS_COMPLETED, self.STATUS_ERROR]:
            raise ValueError(f"Invalid status: {new_status}")
        
        self.status = new_status
        self.updated_at = datetime.utcnow()
        
        if commit:
            try:
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                raise e

    def to_dict(self):
        """Преобразование в словарь для API"""
        return {
            'id': self.id,
            'filename': self.original_filename,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'status': self.status,
            'file_path': self.file_path,
            'file_size': self.file_size,
            'processing_time': self.processing_time,
            'user': self.user.username
        }

    def __repr__(self):
        return f'<ProposalHistory {self.filename}>'

# Индексы для оптимизации запросов
db.Index('idx_proposal_user', ProposalHistory.user_id)
db.Index('idx_proposal_created', ProposalHistory.created_at)
db.Index('idx_proposal_status', ProposalHistory.status)

# События SQLAlchemy
@event.listens_for(User, 'before_insert')
def set_default_role(mapper, connection, target):
    """Установка роли по умолчанию при создании пользователя"""
    if not target.role:
        target.role = 'user'

@event.listens_for(ProposalHistory, 'before_update')
def update_timestamp(mapper, connection, target):
    """Обновление временной метки при изменении записи"""
    target.updated_at = datetime.utcnow()