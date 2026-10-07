import os
import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC

from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.inspection import permutation_importance

from config import TRAINED_MODELS_FOLDER, RISK_THRESHOLDS, PEST_RECOMMENDATIONS

class ModelTrainer:
    def __init__(self):
        self.models = {
            'Decision Tree': DecisionTreeClassifier(random_state=42, max_depth=10),
            'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42, max_depth=12),
            'Naive Bayes': GaussianNB(),
            'K-Nearest Neighbors': KNeighborsClassifier(n_neighbors=5),
            'Support Vector Machine': SVC(probability=True, kernel='rbf', random_state=42)
        }
        self.trained_models = {}
        self.evaluation_results = []
        self.best_model_name = None
        self.best_model = None

    def train_and_evaluate(self, X, y, target_classes, feature_names, test_size=0.2):
        """Splits data, trains all models, evaluates performance, and identifies the best model."""
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y if len(np.unique(y)) > 1 else None
        )

        eval_list = []
        self.trained_models = {}

        for name, clf in self.models.items():
            # Fit model
            clf.fit(X_train, y_train)
            y_pred = clf.predict(X_test)

            acc = float(accuracy_score(y_test, y_pred))
            prec = float(precision_score(y_test, y_pred, average='weighted', zero_division=0))
            rec = float(recall_score(y_test, y_pred, average='weighted', zero_division=0))
            f1 = float(f1_score(y_test, y_pred, average='weighted', zero_division=0))

            # Compute confusion matrix
            labels = list(range(len(target_classes)))
            cm = confusion_matrix(y_test, y_pred, labels=labels)
            cm_list = cm.tolist()

            self.trained_models[name] = clf

            eval_list.append({
                'algorithm': name,
                'accuracy': round(acc, 4),
                'precision': round(prec, 4),
                'recall': round(rec, 4),
                'f1_score': round(f1, 4),
                'confusion_matrix': cm_list,
                'class_labels': [str(c) for c in target_classes]
            })

        self.evaluation_results = eval_list

        # Determine best model based on highest F1 score (fallback to accuracy)
        best_eval = max(eval_list, key=lambda x: (x['f1_score'], x['accuracy']))
        self.best_model_name = best_eval['algorithm']
        self.best_model = self.trained_models[self.best_model_name]

        # Calculate Feature Importance for the best model (or Random Forest fallback)
        feature_importances = self._compute_feature_importance(
            self.best_model, X_test, y_test, feature_names
        )

        return {
            'evaluations': eval_list,
            'best_model': self.best_model_name,
            'feature_importances': feature_importances
        }

    def _compute_feature_importance(self, model, X_test, y_test, feature_names):
        """Extracts Gini feature importances or permutation importances."""
        importances_dict = {}

        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
        else:
            # Use permutation importance for non-tree models
            r = permutation_importance(model, X_test, y_test, n_repeats=5, random_state=42)
            importances = r.importances_mean
            importances = np.maximum(0, importances)  # clamp negative scores

        # Normalize to percentage sum=100
        total = np.sum(importances)
        if total > 0:
            normalized = (importances / total) * 100
        else:
            normalized = [100.0 / len(feature_names)] * len(feature_names)

        items = []
        for name, score in zip(feature_names, normalized):
            items.append({
                'feature': name,
                'importance': round(float(score), 2)
            })

        # Sort descending by importance
        items.sort(key=lambda x: x['importance'], reverse=True)
        return items

    def save_artifacts(self, prep_pipeline, feature_names, target_classes):
        """Serializes the active trained pipeline to disk."""
        os.makedirs(TRAINED_MODELS_FOLDER, exist_ok=True)
        artifact_path = os.path.join(TRAINED_MODELS_FOLDER, 'active_pipeline.joblib')

        # Feature importances for best model
        feature_importances = self._compute_feature_importance(
            self.best_model,
            pd.DataFrame(np.zeros((1, len(feature_names))), columns=feature_names),
            [0],
            feature_names
        )

        bundle = {
            'best_model_name': self.best_model_name,
            'best_model': self.best_model,
            'all_models': self.trained_models,
            'evaluations': self.evaluation_results,
            'prep_pipeline': prep_pipeline,
            'feature_names': feature_names,
            'target_classes': [str(c) for c in target_classes],
            'feature_importances': feature_importances
        }

        joblib.dump(bundle, artifact_path)
        return artifact_path

    @staticmethod
    def load_artifacts():
        """Loads serialized pipeline artifact from disk if available."""
        artifact_path = os.path.join(TRAINED_MODELS_FOLDER, 'active_pipeline.joblib')
        if not os.path.exists(artifact_path):
            return None
        return joblib.load(artifact_path)

    @staticmethod
    def classify_risk(probability_score):
        """Classifies risk level based on model probability score."""
        prob_pct = float(probability_score)
        if prob_pct >= 0.70:
            return 'HIGH'
        elif prob_pct >= 0.40:
            return 'MEDIUM'
        else:
            return 'LOW'

    @staticmethod
    def get_recommendations(pest_name, risk_level):
        """Returns informational IPM preventive recommendations based on pest and risk."""
        pest_data = PEST_RECOMMENDATIONS.get(pest_name)
        if not pest_data:
            return {
                'pest_name': pest_name,
                'description': f'General management advice for {pest_name}.',
                'recommendations': [
                    'Inspect crops regularly for signs of leaf damage or wilting.',
                    'Consult local agricultural extension agents for targeted pest control.',
                    'Maintain field hygiene and proper irrigation management.'
                ]
            }

        recs = pest_data.get(risk_level, pest_data.get('Medium', []))
        return {
            'pest_name': pest_name,
            'description': pest_data.get('description', ''),
            'recommendations': recs
        }
