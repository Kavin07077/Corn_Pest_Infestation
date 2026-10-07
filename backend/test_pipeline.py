import os, sys
import json

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import init_db
from config import DEFAULT_TARGET_COLUMN, DEFAULT_DATASET_PATH
import pandas as pd
from preprocessing.pipeline import PreprocessingPipeline
from ml.trainer import ModelTrainer
from routes.predict_routes import predict_pest

def test_full_backend():
    print("=== Testing Database Initialization ===")
    init_db()
    print("Database initialized successfully.")

    print("\n=== Testing Preprocessing Pipeline ===")
    df = pd.read_csv(DEFAULT_DATASET_PATH)
    pipeline = PreprocessingPipeline(target_column=DEFAULT_TARGET_COLUMN)
    clean_df, stats = pipeline.process(df)
    print("Clean stats:", json.dumps(stats, indent=2))

    X_encoded, y_encoded = pipeline.prepare_encoded_features(clean_df)
    feature_names = pipeline.numerical_cols + pipeline.categorical_cols
    target_classes = pipeline.target_encoder.classes_

    print("\n=== Testing Model Training & Evaluation ===")
    trainer = ModelTrainer()
    results = trainer.train_and_evaluate(X_encoded, y_encoded, target_classes, feature_names, test_size=0.2)
    print("Best Model:", results['best_model'])
    print("\nModel Evaluation Table:")
    for eval_item in results['evaluations']:
        print(f"Algorithm: {eval_item['algorithm']:<22} | Acc: {eval_item['accuracy']:.4f} | Prec: {eval_item['precision']:.4f} | Rec: {eval_item['recall']:.4f} | F1: {eval_item['f1_score']:.4f}")

    print("\nSaving Joblib Artifacts...")
    path = trainer.save_artifacts(pipeline, feature_names, target_classes)
    print("Artifact saved to:", path)

    print("\n=== Testing Inference & Prediction ===")
    sample_input = {
        'Temperature': 31.5,
        'Humidity': 78.0,
        'Rainfall': 110.0,
        'Soil_Moisture': 68.0,
        'Wind_Speed': 12.0,
        'Crop_Age': 35,
        'Growth_Stage': 'Vegetative',
        'Season': 'Kharif',
        'Location': 'North Zone'
    }

    row_df = pipeline.transform_single_input(sample_input)
    best_model = results['best_model']
    pred_idx = trainer.best_model.predict(row_df)[0]
    predicted_pest = target_classes[pred_idx]
    probs = trainer.best_model.predict_proba(row_df)[0]
    max_prob = float(probs[pred_idx])
    risk_level = ModelTrainer.classify_risk(max_prob)
    recommendations = ModelTrainer.get_recommendations(predicted_pest, risk_level)

    print(f"Predicted Pest: {predicted_pest}")
    print(f"Probability: {max_prob * 100:.1f}%")
    print(f"Risk Level: {risk_level}")
    print("Top Recommendations:", recommendations['recommendations'][:2])
    print("\n=== All Tests Passed Successfully! ===")

if __name__ == '__main__':
    test_full_backend()
