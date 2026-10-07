from flask import Blueprint, request, jsonify
from config import DEFAULT_TARGET_COLUMN
from preprocessing.pipeline import PreprocessingPipeline
from ml.trainer import ModelTrainer
from database import log_model_results
from routes.dataset_routes import get_current_df

model_bp = Blueprint('model', __name__)

@model_bp.route('/api/train', methods=['POST'])
def train_models():
    try:
        data = request.get_json(silent=True) or {}
        test_size = float(data.get('test_size', 0.2))

        df = get_current_df()
        pipeline = PreprocessingPipeline(target_column=DEFAULT_TARGET_COLUMN)
        clean_df, stats = pipeline.process(df)

        X_encoded, y_encoded = pipeline.prepare_encoded_features(clean_df)

        feature_names = pipeline.numerical_cols + pipeline.categorical_cols
        target_classes = pipeline.target_encoder.classes_

        trainer = ModelTrainer()
        results = trainer.train_and_evaluate(
            X_encoded, y_encoded, target_classes, feature_names, test_size=test_size
        )

        # Save artifacts to joblib
        artifact_path = trainer.save_artifacts(pipeline, feature_names, target_classes)

        # Log results to SQLite DB
        log_model_results(results['evaluations'], results['best_model'])

        return jsonify({
            'message': 'Model training & evaluation completed successfully',
            'best_model': results['best_model'],
            'evaluations': results['evaluations'],
            'feature_importances': results['feature_importances'],
            'clean_stats': stats,
            'artifact_path': artifact_path
        })
    except Exception as e:
        return jsonify({'error': f'Model training failed: {str(e)}'}), 500

@model_bp.route('/api/models', methods=['GET'])
def get_models():
    try:
        bundle = ModelTrainer.load_artifacts()
        if not bundle:
            # Trigger auto-train if no artifact exists yet
            df = get_current_df()
            pipeline = PreprocessingPipeline(target_column=DEFAULT_TARGET_COLUMN)
            clean_df, stats = pipeline.process(df)
            X_encoded, y_encoded = pipeline.prepare_encoded_features(clean_df)
            feature_names = pipeline.numerical_cols + pipeline.categorical_cols
            target_classes = pipeline.target_encoder.classes_
            trainer = ModelTrainer()
            results = trainer.train_and_evaluate(X_encoded, y_encoded, target_classes, feature_names)
            trainer.save_artifacts(pipeline, feature_names, target_classes)
            log_model_results(results['evaluations'], results['best_model'])
            bundle = ModelTrainer.load_artifacts()

        return jsonify({
            'best_model_name': bundle['best_model_name'],
            'evaluations': bundle['evaluations'],
            'feature_names': bundle['feature_names'],
            'target_classes': bundle['target_classes']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@model_bp.route('/api/model/evaluation', methods=['GET'])
def get_model_evaluation():
    try:
        bundle = ModelTrainer.load_artifacts()
        if not bundle:
            return jsonify({'error': 'No model has been trained yet. Please trigger model training first.'}), 404

        return jsonify({
            'best_model_name': bundle['best_model_name'],
            'evaluations': bundle['evaluations'],
            'target_classes': bundle['target_classes']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@model_bp.route('/api/feature-importance', methods=['GET'])
def get_feature_importance():
    try:
        bundle = ModelTrainer.load_artifacts()
        if not bundle:
            return jsonify({'error': 'No trained model artifact found'}), 404

        return jsonify({
            'best_model_name': bundle['best_model_name'],
            'feature_importances': bundle['feature_importances']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
