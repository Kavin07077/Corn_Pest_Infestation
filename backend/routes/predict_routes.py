from flask import Blueprint, request, jsonify
from ml.trainer import ModelTrainer
from database import log_prediction, get_prediction_history, delete_prediction_item

predict_bp = Blueprint('predict', __name__)

@predict_bp.route('/api/predict', methods=['POST'])
def predict_pest():
    try:
        input_data = request.get_json()
        if not input_data:
            return jsonify({'error': 'No input parameters provided'}), 400

        # Load active trained model pipeline artifact
        bundle = ModelTrainer.load_artifacts()
        if not bundle:
            return jsonify({'error': 'No trained machine learning model available. Please train models first.'}), 400

        best_model = bundle['best_model']
        prep_pipeline = bundle['prep_pipeline']
        target_classes = bundle['target_classes']

        # Preprocess & encode single input vector
        row_df = prep_pipeline.transform_single_input(input_data)

        # Predict target class index
        pred_idx = best_model.predict(row_df)[0]
        predicted_pest = str(target_classes[pred_idx])

        # Compute probability vector across all classes if supported
        all_probs = []
        max_prob = 0.85 # default fallback if model doesn't support predict_proba

        if hasattr(best_model, 'predict_proba'):
            probs = best_model.predict_proba(row_df)[0]
            max_prob = float(probs[pred_idx])

            for idx, prob in enumerate(probs):
                pest_name = str(target_classes[idx])
                prob_val = float(prob)
                all_probs.append({
                    'pest': pest_name,
                    'probability': round(prob_val, 4),
                    'percentage': round(prob_val * 100, 1)
                })

            # Sort descending by probability
            all_probs.sort(key=lambda x: x['probability'], reverse=True)
        else:
            # Single prediction entry
            all_probs = [{
                'pest': predicted_pest,
                'probability': 0.85,
                'percentage': 85.0
            }]

        # Risk Classification (LOW / MEDIUM / HIGH)
        risk_level = ModelTrainer.classify_risk(max_prob)

        # Get IPM preventive recommendations
        recommendation = ModelTrainer.get_recommendations(predicted_pest, risk_level)

        # Log prediction query to SQLite database
        pred_id = log_prediction(input_data, predicted_pest, max_prob, risk_level)

        return jsonify({
            'prediction_id': pred_id,
            'predicted_pest': predicted_pest,
            'probability': round(max_prob, 4),
            'probability_percent': round(max_prob * 100, 1),
            'risk_level': risk_level,
            'all_probabilities': all_probs,
            'recommendation': recommendation,
            'model_used': bundle['best_model_name']
        })
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@predict_bp.route('/api/predictions', methods=['GET'])
def get_history():
    try:
        limit = int(request.args.get('limit', 50))
        history = get_prediction_history(limit=limit)
        return jsonify({
            'count': len(history),
            'history': history
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@predict_bp.route('/api/predictions/<int:pred_id>', methods=['DELETE'])
def delete_history_item(pred_id):
    try:
        delete_prediction_item(pred_id)
        return jsonify({'message': f'Prediction record #{pred_id} deleted successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
