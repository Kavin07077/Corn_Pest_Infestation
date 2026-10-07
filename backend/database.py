import sqlite3
import json
from datetime import datetime
from config import DATABASE_PATH

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()

    # Datasets table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS datasets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT NOT NULL,
            upload_date TEXT NOT NULL,
            record_count INTEGER,
            column_count INTEGER,
            filepath TEXT NOT NULL
        )
    ''')

    # Models table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS models (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            algorithm TEXT NOT NULL,
            accuracy REAL,
            precision REAL,
            recall REAL,
            f1_score REAL,
            training_date TEXT NOT NULL,
            is_best INTEGER DEFAULT 0
        )
    ''')

    # Prediction History table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS prediction_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            input_data TEXT NOT NULL,
            predicted_pest TEXT NOT NULL,
            probability REAL,
            risk_level TEXT NOT NULL,
            prediction_date TEXT NOT NULL
        )
    ''')

    conn.commit()
    conn.close()

def log_dataset_upload(filename, record_count, column_count, filepath):
    conn = get_db_connection()
    cursor = conn.cursor()
    upload_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute('''
        INSERT INTO datasets (filename, upload_date, record_count, column_count, filepath)
        VALUES (?, ?, ?, ?, ?)
    ''', (filename, upload_date, record_count, column_count, filepath))
    conn.commit()
    conn.close()

def log_model_results(models_eval, best_algo_name):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Clear previous model evaluations log
    cursor.execute('DELETE FROM models')
    training_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    for model_info in models_eval:
        is_best = 1 if model_info['algorithm'] == best_algo_name else 0
        cursor.execute('''
            INSERT INTO models (algorithm, accuracy, precision, recall, f1_score, training_date, is_best)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            model_info['algorithm'],
            model_info['accuracy'],
            model_info['precision'],
            model_info['recall'],
            model_info['f1_score'],
            training_date,
            is_best
        ))
    conn.commit()
    conn.close()

def log_prediction(input_data_dict, predicted_pest, probability, risk_level):
    conn = get_db_connection()
    cursor = conn.cursor()
    pred_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    input_json = json.dumps(input_data_dict)
    cursor.execute('''
        INSERT INTO prediction_history (input_data, predicted_pest, probability, risk_level, prediction_date)
        VALUES (?, ?, ?, ?, ?)
    ''', (input_json, predicted_pest, float(probability), risk_level, pred_date))
    conn.commit()
    last_id = cursor.lastrowid
    conn.close()
    return last_id

def get_prediction_history(limit=50):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, input_data, predicted_pest, probability, risk_level, prediction_date
        FROM prediction_history
        ORDER BY id DESC
        LIMIT ?
    ''', (limit,))
    rows = cursor.fetchall()
    conn.close()

    history = []
    for row in rows:
        history.append({
            'id': row['id'],
            'input_data': json.loads(row['input_data']),
            'predicted_pest': row['predicted_pest'],
            'probability': row['probability'],
            'risk_level': row['risk_level'],
            'prediction_date': row['prediction_date']
        })
    return history

def delete_prediction_item(pred_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM prediction_history WHERE id = ?', (pred_id,))
    conn.commit()
    conn.close()
