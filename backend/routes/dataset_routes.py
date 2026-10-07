import os
import pandas as pd
from flask import Blueprint, request, jsonify
from config import DEFAULT_DATASET_PATH, UPLOAD_FOLDER, DEFAULT_TARGET_COLUMN
from preprocessing.pipeline import PreprocessingPipeline
from database import log_dataset_upload

dataset_bp = Blueprint('dataset', __name__)

# Global active dataset path tracker
active_dataset_path = DEFAULT_DATASET_PATH

def get_current_df():
    global active_dataset_path
    if not os.path.exists(active_dataset_path):
        active_dataset_path = DEFAULT_DATASET_PATH
    return pd.read_csv(active_dataset_path)

@dataset_bp.route('/api/dataset/upload', methods=['POST'])
def upload_dataset():
    global active_dataset_path
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Invalid file type. Only CSV files are supported'}), 400

    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    save_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(save_path)

    try:
        df = pd.read_csv(save_path)
        if df.empty:
            return jsonify({'error': 'Uploaded CSV dataset is empty'}), 400

        active_dataset_path = save_path
        pipeline = PreprocessingPipeline(target_column=DEFAULT_TARGET_COLUMN)
        telemetry = pipeline.inspect_dataset(df)

        log_dataset_upload(
            file.filename,
            telemetry['total_records'],
            telemetry['total_columns'],
            save_path
        )

        return jsonify({
            'message': 'Dataset uploaded successfully',
            'filename': file.filename,
            'telemetry': telemetry
        })
    except Exception as e:
        return jsonify({'error': f'Failed to parse CSV dataset: {str(e)}'}), 500

@dataset_bp.route('/api/dataset/statistics', methods=['GET'])
def get_statistics():
    try:
        df = get_current_df()
        pipeline = PreprocessingPipeline(target_column=DEFAULT_TARGET_COLUMN)
        telemetry = pipeline.inspect_dataset(df)
        return jsonify(telemetry)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dataset_bp.route('/api/dataset/preview', methods=['GET'])
def get_preview():
    try:
        df = get_current_df()

        # Parse query params
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('page_size', 15))
        search_query = request.args.get('search', '').strip()
        sort_by = request.args.get('sort_by', None)
        sort_order = request.args.get('sort_order', 'asc')

        # Filter search across string columns
        if search_query:
            mask = pd.Series(False, index=df.index)
            for col in df.columns:
                mask |= df[col].astype(str).str.contains(search_query, case=False, na=False)
            filtered_df = df[mask]
        else:
            filtered_df = df

        # Sort
        if sort_by and sort_by in filtered_df.columns:
            ascending = (sort_order.lower() == 'asc')
            filtered_df = filtered_df.sort_values(by=sort_by, ascending=ascending)

        total_filtered = len(filtered_df)
        total_pages = max(1, (total_filtered + page_size - 1) // page_size)

        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size

        page_records = filtered_df.iloc[start_idx:end_idx].fillna('').to_dict(orient='records')

        return jsonify({
            'total_records': len(df),
            'filtered_records': total_filtered,
            'page': page,
            'page_size': page_size,
            'total_pages': total_pages,
            'columns': list(df.columns),
            'records': page_records
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@dataset_bp.route('/api/dataset/columns', methods=['GET'])
def get_columns():
    try:
        df = get_current_df()
        dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}
        pipeline = PreprocessingPipeline(target_column=DEFAULT_TARGET_COLUMN)
        telemetry = pipeline.inspect_dataset(df)

        return jsonify({
            'columns': list(df.columns),
            'target_column': telemetry['target_column'],
            'numerical_cols': telemetry['numerical_cols'],
            'categorical_cols': telemetry['categorical_cols'],
            'pest_categories': telemetry['pest_categories'],
            'dtypes': dtypes
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
