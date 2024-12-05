from flask import Blueprint, request, jsonify, current_app, send_from_directory
from werkzeug.utils import secure_filename
from pathlib import Path
from datetime import datetime
import time
import os
from .models import db, User, ProposalHistory
from .utils import load_config, process_excel, generate_word
from .middleware.auth import token_required
from .utils import process_excel, ExcelValidationError

# Создаем Blueprint для маршрутов
bp = Blueprint('routes', __name__)

@bp.route("/api/create-proposal", methods=["POST"])
@token_required


# Endpoint для создания коммерческого предложения из загруженного Excel-файла
def create_proposal(current_user):
    try:
        # Проверяем, что файл был отправлен
        if 'file' not in request.files:
            return jsonify({"error": "Файл не был загружен"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "Файл не выбран"}), 400

        # Начало отсчета времени обработки
        start_time = time.time()
            
        # Создаем безопасное имя файла
        filename = secure_filename(file.filename)
            
        # Создаем необходимые директории
        for folder in ['UPLOAD_FOLDER', 'TEMPLATE_FOLDER', 'OUTPUT_FOLDER']:
            Path(current_app.config[folder]).mkdir(exist_ok=True)
            
        # Пути к файлам
        excel_path = Path(current_app.config['UPLOAD_FOLDER']) / filename
        template_path = Path(current_app.config['TEMPLATE_FOLDER']) / "template.docx"
        
        # Создаем запись в истории
        proposal = ProposalHistory(
            user_id=current_user.id,
            filename=filename,
            original_filename=file.filename
        )
        
        try:
            # Сохраняем файл и обновляем информацию
            file.save(excel_path)
            proposal.file_size = excel_path.stat().st_size
            proposal.mime_type = file.content_type
            proposal.update_status(ProposalHistory.STATUS_PROCESSING)
            
            # Загружаем конфигурацию и обрабатываем файл
            config = load_config('config.json')
            success, error_msg, data = process_excel(str(excel_path), config)
            
            if not data:
                proposal.update_status(ProposalHistory.STATUS_ERROR)
                return jsonify({'error': 'Ошибка при обработке Excel файла'}), 400
                
            proposal.data = data

            if not success:
             # Обрабатываем ошибку валидации
            if isinstance(error_msg, ExcelValidationError):
                return jsonify({'error': error_msg.details}), 400
            else:
                return jsonify({'error': error_msg}), 400 # Или 500, если это внутренняя ошибка
            
            # Генерируем уникальное имя для выходного файла
            output_filename = f"proposal_{proposal.id}_{int(time.time())}.docx"
            output_path = Path(current_app.config['OUTPUT_FOLDER']) / output_filename
            
            # Генерируем документ
            if not generate_word(data, str(template_path), str(output_path)):
                proposal.update_status(ProposalHistory.STATUS_ERROR)
                return jsonify({'error': 'Ошибка при создании документа'}), 500
                
            # Обновляем информацию о предложении
            proposal.file_path = output_filename
            proposal.processing_time = time.time() - start_time
            proposal.update_status(ProposalHistory.STATUS_COMPLETED)
            
            return jsonify({
                'success': True,
                'proposal': proposal.to_dict(),
                'file_url': f'/api/download/{output_filename}'
            })
            
        except Exception as e:
            proposal.update_status(ProposalHistory.STATUS_ERROR)
            raise e
            
        finally:
            # Удаляем временный Excel файл
            if excel_path.exists():
                excel_path.unlink()
                
    except Exception as e:
        current_app.logger.exception("Ошибка при создании коммерческого предложения")
        return jsonify({'error': str(e)}), 500

@bp.route('/api/download/<filename>')
@token_required
def download_file(current_user, filename):
    """
    Endpoint для скачивания созданного файла
    """
    try:
        # Проверяем права доступа к файлу
        proposal = ProposalHistory.query.filter_by(file_path=filename).first()
        if not proposal:
            return jsonify({'error': 'Файл не найден'}), 404
            
        if proposal.user_id != current_user.id and current_user.role != 'admin':
            return jsonify({'error': 'Нет доступа к файлу'}), 403
            
        return send_from_directory(
            current_app.config['OUTPUT_FOLDER'],
            filename,
            as_attachment=True
        )
        
    except Exception as e:
        current_app.logger.exception("Ошибка при скачивании файла")
        return jsonify({'error': 'Файл не найден'}), 404

@bp.route('/api/proposals')
@token_required
def get_proposals(current_user):
    """
    Получение списка предложений пользователя
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        proposals = ProposalHistory.query\
            .filter_by(user_id=current_user.id)\
            .order_by(ProposalHistory.created_at.desc())\
            .paginate(page=page, per_page=per_page)
        
        return jsonify({
            'items': [p.to_dict() for p in proposals.items],
            'total': proposals.total,
            'pages': proposals.pages,
            'current_page': page
        })
        
    except Exception as e:
        current_app.logger.exception("Ошибка при получении списка предложений")
        return jsonify({'error': str(e)}), 500

# Регистрация Blueprint
def register_routes(app):
    app.register_blueprint(bp)