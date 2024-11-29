from flask import request, jsonify, render_template, send_file, redirect, url_for
from app import app, db, User
from utils import process_excel, generate_word # Импортируем новую функцию
from werkzeug.security import generate_password_hash, check_password_hash
import os

@app.route('/create_cp', methods=['GET', 'POST'])
def create_cp():
    # ... (обработка загрузки файла без изменений) ...
    pdf = generate_word(data) # Используем generate_word
    return send_file(pdf, download_name='commercial_proposal.docx', as_attachment=True)






