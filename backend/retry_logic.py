import os
import time
from typing import Dict, Optional, Tuple, Callable
from functools import wraps
import logging
from concurrent.futures import ThreadPoolExecutor
import threading
from dataclasses import dataclass
from datetime import datetime

@dataclass
class UploadStatus:
    """Класс для хранения статуса загрузки"""
    id: str
    filename: str
    started_at: datetime
    total_size: int
    processed_size: int = 0
    status: str = 'pending'  # pending, processing, completed, failed
    retry_count: int = 0
    error: Optional[str] = None
    progress: float = 0.0

class UploadTracker:
    """Менеджер отслеживания загрузок"""
    def __init__(self):
        self._uploads: Dict[str, UploadStatus] = {}
        self._lock = threading.Lock()
        
    def create_upload(self, upload_id: str, filename: str, total_size: int) -> UploadStatus:
        status = UploadStatus(
            id=upload_id,
            filename=filename,
            started_at=datetime.now(),
            total_size=total_size
        )
        with self._lock:
            self._uploads[upload_id] = status
        return status

    def update_progress(self, upload_id: str, processed_size: int):
        with self._lock:
            if upload_id in self._uploads:
                status = self._uploads[upload_id]
                status.processed_size = processed_size
                status.progress = (processed_size / status.total_size) * 100

    def set_status(self, upload_id: str, status: str, error: Optional[str] = None):
        with self._lock:
            if upload_id in self._uploads:
                self._uploads[upload_id].status = status
                if error:
                    self._uploads[upload_id].error = error

    def increment_retry(self, upload_id: str):
        with self._lock:
            if upload_id in self._uploads:
                self._uploads[upload_id].retry_count += 1

    def get_status(self, upload_id: str) -> Optional[UploadStatus]:
        with self._lock:
            return self._uploads.get(upload_id)

# Глобальный трекер загрузок
upload_tracker = UploadTracker()

def with_retry(max_retries: int = 3, delay: float = 1.0):
    """Декоратор для повторных попыток выполнения функции"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            upload_id = kwargs.get('upload_id')

            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    logging.error(f"Attempt {attempt + 1} failed: {str(e)}")
                    
                    if upload_id:
                        upload_tracker.increment_retry(upload_id)
                        upload_tracker.set_status(upload_id, 'retrying', str(e))
                    
                    if attempt < max_retries - 1:
                        time.sleep(delay * (2 ** attempt))  # Экспоненциальная задержка
                    
            if upload_id:
                upload_tracker.set_status(upload_id, 'failed', str(last_exception))
            raise last_exception

        return wrapper
    return decorator

class FileProcessor:
    """Класс для обработки файлов с отслеживанием прогресса"""
    def __init__(self, chunk_size: int = 8192):
        self.chunk_size = chunk_size
        self.executor = ThreadPoolExecutor(max_workers=4)
        self._stop_event = threading.Event()

    def process_in_chunks(self, 
                         file_obj,
                         upload_id: str,
                         process_chunk: Callable) -> bool:
        """Обработка файла по частям с отслеживанием прогресса"""
        try:
            file_size = os.fstat(file_obj.fileno()).st_size
            processed_size = 0
            
            upload_tracker.create_upload(upload_id, file_obj.filename, file_size)
            upload_tracker.set_status(upload_id, 'processing')

            while not self._stop_event.is_set():
                chunk = file_obj.read(self.chunk_size)
                if not chunk:
                    break

                process_chunk(chunk)
                processed_size += len(chunk)
                upload_tracker.update_progress(upload_id, processed_size)

            if self._stop_event.is_set():
                upload_tracker.set_status(upload_id, 'cancelled')
                return False

            upload_tracker.set_status(upload_id, 'completed')
            return True

        except Exception as e:
            upload_tracker.set_status(upload_id, 'failed', str(e))
            raise

    def cancel_processing(self):
        """Отмена обработки файла"""
        self._stop_event.set()

# Пример использования в utils.py:
@with_retry(max_retries=3)
def process_excel(file, upload_id: str) -> Tuple[bool, str, Dict]:
    """Обработка Excel файла с поддержкой retry и отслеживанием прогресса"""
    try:
        processor = FileProcessor()
        
        # Валидация файла
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise ValidationError("Неверный формат файла")

        # Проверка размера
        file_size = len(file.read())
        if file_size > 10 * 1024 * 1024:
            raise FileError("Файл слишком большой")
        file.seek(0)

        def process_chunk(chunk):
            # Здесь может быть дополнительная обработка чанка
            pass

        # Обработка файла по частям
        success = processor.process_in_chunks(file, upload_id, process_chunk)
        if not success:
            raise FileError("Обработка файла была отменена")

        # Чтение и валидация Excel
        df = pd.read_excel(file)
        validate_excel_structure(df)
        validate_excel_data(df)

        return True, "Файл успешно обработан", {
            'preview': df.head().to_dict(),
            'summary': {
                'total_rows': len(df),
                'total_sum': df['price'].sum() if 'price' in df.columns else 0
            }
        }

    except Exception as e:
        logging.exception("Ошибка при обработке файла")
        raise

# В routes.py:
@app.route('/api/validate-excel', methods=['POST'])
def validate_excel_endpoint():
    try:
        file = request.files['file']
        upload_id = str(uuid.uuid4())
        
        success, message, data = process_excel(file, upload_id)
        
        return jsonify({
            'success': success,
            'message': message,
            'data': data,
            'upload_id': upload_id
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/api/upload-status/<upload_id>')
def get_upload_status(upload_id):
    """Endpoint для получения статуса загрузки"""
    status = upload_tracker.get_status(upload_id)
    if status:
        return jsonify({
            'success': True,
            'status': {
                'id': status.id,
                'filename': status.filename,
                'status': status.status,
                'progress': status.progress,
                'retry_count': status.retry_count,
                'error': status.error
            }
        })
    return jsonify({
        'success': False,
        'error': 'Upload not found'
    }), 404

@app.route('/api/cancel-upload/<upload_id>', methods=['POST'])
def cancel_upload(upload_id):
    """Endpoint для отмены загрузки"""
    processor = FileProcessor()
    processor.cancel_processing()
    upload_tracker.set_status(upload_id, 'cancelled')
    return jsonify({'success': True})