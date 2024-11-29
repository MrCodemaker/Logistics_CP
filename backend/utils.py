from pydoc import doc
import openpyxl
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from logging
import json
from pathlib import Path
from typing import Dict, Optional, Any
from datetime import datetime
from flask import logging, render_template


"""Настраивает систему логирования с ротацией файлов"""
def setup_logging():
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    log_file = log_dir / f"app_{datetime.now().strftime('%Y%m%d')}.log"

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler() # Также выводим в консоль
        ]
    )
"""
    Загружает конфигурацию из JSON-файла
    Args:
        config_path (str): Путь к файлу конфигурации
    
    Returns:
        Dict: Словарь с настройками
    
    Raises:
        FileNotFoundError: Если файл конфигурации не найден
        json.JSONDecodeError: Если файл содержит некорректный JSON
"""
def load_config(config_path: str) -> Dict:
    try:
        with open(config_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        logging.error(f"Файл конфигурации '{config_path}' не найден.")
        raise
    except json.JSONDecodeError:
        logging.error(f"Файл конфигурации '{config_path}' содержит некорректный JSON.")
        raise
"""
    Обрабатывает Excel-файл и извлекает данные согласно конфигурации
    
    Args:
        file_path (str): Путь к Excel-файлу
        config (Dict): Словарь с настройками извлечения данных
    
    Returns:
        Optional[Dict[str, Any]]: Словарь с извлеченными данными или None при ошибке
    """
def process_excel(file_path: str, config: Dict) -> Optional[Dict[str, Any]]:
    try:
        # Проверяем существование файла
        if not Path(file_path).exists():
            raise FileNotFoundError(f"Excel файл не найден: {file_path}")

        workbook = openpyxl.load_workbook(file_path, data_only=True)
        data = {}
        
        # Перебираем все листы из конфигурации
        for sheet_config in config:
            sheet_name = sheet_config["sheet_name"]
            if sheet_name not in workbook.sheetnames:
                logging.warning(f"Лист '{sheet_name}' не найден")
                continue

            sheet = workbook[sheet_name]
            
            # Извлекаем данные согласно маппингу
            for key, cell_address in sheet_config["data_mapping"].items():
                try:
                    cell = sheet[cell_address]
                    # Добавляем базовую валидацию данных
                    if cell.value is not None:
                        data[key] = cell.value
                    else:
                        logging.warning(f"Пустая ячейка: {cell_address} на листе {sheet_name}")
                        data[key] = None
                except KeyError:
                    logging.error(f"Неверный адрес ячейки: {cell_address}")
                    data[key] = None

        return data if data else None

    except Exception as e:
        logging.exception("Ошибка при обработке Excel файла")
        return None
"""
    Генерирует Word-документ на основе шаблона и данных
    
    Args:
        data (Dict[str, Any]): Данные для вставки в документ
        template_path (str): Путь к шаблону Word
        output_path (str): Путь для сохранения результата
    
    Returns:
        Optional[str]: Путь к созданному файлу или None при ошибке
    """
def generate_word(data: Dict[str, Any], template_path: str, output_path: str) -> Optional[str]:
    try:
        doc = Document(template_path)
        
        # Обрабатываем закладки в документе
        for bookmark in doc.bookmarks:
            if bookmark.name in data:
                value = data[bookmark.name]
                
                # Форматируем значение в зависимости от типа
                formatted_value = format_value(value)
                
                # Вставляем значение в закладку
                run = bookmark.parent.add_run()
                run.text = formatted_value
                
                # Применяем базовое форматирование
                if isinstance(value, (int, float)):
                    run.font.size = Pt(11)
                    run.font.name = 'Arial'

        # Сохраняем документ
        output_file = Path(output_path)
        output_file.parent.mkdir(exist_ok=True)
        doc.save(output_file)
        
        logging.info(f"Документ успешно создан: {output_file}")
        return str(output_file)

    except Exception as e:
        logging.exception("Ошибка при генерации Word документа")
        return None
"""
    Форматирует значение для вставки в документ
    
    Args:
        value (Any): Значение для форматирования
    
    Returns:
        str: Отформатированное значение
"""
def format_value(value: Any) -> str:
    if isinstance(value, (int, float)):
        return f"{value:,.2f}".replace(',', ' ')
    elif isinstance(value, bool):
        return "Да" if value else "Нет"
    elif value is None:
        return ""
    else:
        return str(value)

# Инициализация при импорте модуля
setup_logging()