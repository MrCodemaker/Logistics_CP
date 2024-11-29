from pydoc import doc
import openpyxl
from docx import Document
from docx.shared import Inches
from flask import render_template
import json
import logging

config_path = 'config.json'
with open(config_path, 'r') as f:
    config = json.load(f)

file_path = 'your_excel_file.xlsx'
template_path = 'your_template.docx'

data = process_excel(file_path, config)
if data:
    word_file = generate_word(data, template_path)
    if word_file:
        print(f"Word-файл успешно создан: {word_file}")

# Настройка логирования
logging.basicConfig(level=logging.ERROR,
                    format='%(asctime)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s',
                    filename='error.log', # Файл для логов
                    filemode='w') # Записываем в файл, перезаписывая его каждый раз

"""Извлекает и брабатывает указанные листы из Excel-файла, используя конфигурационный словарь."""
def process_excel(file_path, config_path):
    try:
        workbook = openpyxl.load_workbook(file_path, data_only=True) # data_only=True для получения значений, а не формул 
        sheet_name = config.get("sheet_name", "service_list") # Имя листа, содержащего нужные данные

        if sheet_name in workbook.sheetnames:
            sheet = workbook[sheet_name]
            data = {} # ... извлечение данных из sheet ...
            for key, cell_address in config.get("data_mapping").items():
                try:
                    cell = sheet[cell_address]
                    data[key] = cell.value
                except KeyError:
                    print(f"Ключ '{cell_address}' не найдена на листе '{sheet_name}'.")
                    data[key] = None # Или поднять исключение
                except Exception as e:
                    logging.exception(f"Ошибка в функции process_excel: {e}") # Логируем исключение с traceback
                    return None # Или поднять исключение
            return data
        else:
            print(f"Лист '{sheet_name}' не найден в файле.")
            return None # Или поднять исключение
    
    except FileNotFoundError:
        print(f"Файл '{file_path}' не найден.")
        return None # Или поднять исключение
    except Exception as e:
        print(f"Произошла ошибка при обработке файла: {e}")
        return None # Или поднять исключение

"""Генерирует Word-файл из данных шаблона, обрабатывая закладки вне таблиц и различные типы данных."""
def generate_word(data, template_path):
    try:
        doc = Document(template_path)
        # Обработка всех закладок  (предполагается, что все закладки находятся в таблицах)
        for bookmark in doc.bookmarks:
            if bookmark.name in data:
                value = data[bookmark.name]
                # Обработка различных типов данных
                if isinstance(value, (int, float)):
                    # Для чисел используем форматирование
                    bookmark.text = "{:.2f}".format(value)  # Форматирование с двумя знаками после запятой
                elif isinstance(value, bool):
                    bookmark.text = str(value).lower() # "true" или "false"
                elif value is None:
                    bookmark.text = "" # Пустая строка для None
                else:
                    bookmark.text = str(value) # Для строк и других типов данных
            else:
                print(f"Закладка '{bookmark.name}' не найдена в данных.")
                # Можно добавить альтернативное действие, например, оставить закладку без изменений или заполниь ее значением по умолчанию.
    except Exception as e:
        logging.exception(f"Ошибка в функции generate_word: {e}") # Логируем исключение с traceback
        return None # Или поднять исключение

        # Сохраняем документ
        doc.save('commercial_proposal_wms.docx')
        return 'commercial_proposal_wms.docx' # Возвращаем путь к файлу
    except FileNotFoundError:
        print(f"Шаблон '{template_path}' не найден.")
        return None # Или поднять исключение
    except Exception as e:
        print(f"Произошла ошибка при генерации Word-файла: {e}")
        return None # Или поднять исключение