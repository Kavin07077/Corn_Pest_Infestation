from flask import Blueprint, jsonify
from config import DEFAULT_TARGET_COLUMN
from preprocessing.pipeline import PreprocessingPipeline
from routes.dataset_routes import get_current_df

preprocess_bp = Blueprint('preprocess', __name__)

@preprocess_bp.route('/api/preprocess', methods=['POST', 'GET'])
def run_preprocessing():
    try:
        df = get_current_df()
        pipeline = PreprocessingPipeline(target_column=DEFAULT_TARGET_COLUMN)

        # Inspect initial stats before cleaning
        before_stats = pipeline.inspect_dataset(df)

        # Execute cleaning
        clean_df, stats = pipeline.process(df)

        # Feature preparation summary
        X_encoded, y_encoded = pipeline.prepare_encoded_features(clean_df)

        # Sample clean records
        clean_preview = clean_df.head(10).fillna('').to_dict(orient='records')

        return jsonify({
            'message': 'Data preprocessing completed successfully',
            'raw_telemetry': before_stats,
            'clean_stats': stats,
            'features': {
                'numerical': pipeline.numerical_cols,
                'categorical': pipeline.categorical_cols,
                'target': pipeline.target_column,
                'total_encoded_features': X_encoded.shape[1]
            },
            'sample_records': clean_preview
        })
    except Exception as e:
        return jsonify({'error': f'Preprocessing failed: {str(e)}'}), 500
