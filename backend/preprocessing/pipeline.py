import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import LabelEncoder, StandardScaler

class PreprocessingPipeline:
    def __init__(self, target_column='Pest_Type'):
        self.target_column = target_column
        self.numerical_cols = []
        self.categorical_cols = []
        self.label_encoders = {}
        self.target_encoder = None
        self.scaler = StandardScaler()
        self.imputation_values = {}
        self.stats = {}

    def inspect_dataset(self, df):
        """Returns initial dataset telemetry prior to cleaning."""
        total_records = len(df)
        total_columns = len(df.columns)
        missing_total = int(df.isnull().sum().sum())
        duplicate_count = int(df.duplicated().sum())

        missing_by_col = df.isnull().sum().to_dict()
        missing_cols = {k: int(v) for k, v in missing_by_col.items() if v > 0}

        dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}

        # Identify columns
        target = self.target_column if self.target_column in df.columns else df.columns[-1]
        feature_cols = [c for c in df.columns if c != target]

        num_cols = df[feature_cols].select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = df[feature_cols].select_dtypes(exclude=[np.number]).columns.tolist()

        unique_pests = df[target].dropna().unique().tolist() if target in df.columns else []

        return {
            'total_records': total_records,
            'total_columns': total_columns,
            'missing_total': missing_total,
            'missing_cols': missing_cols,
            'duplicate_count': duplicate_count,
            'target_column': target,
            'numerical_cols': num_cols,
            'categorical_cols': cat_cols,
            'pest_categories': [str(p) for p in unique_pests],
            'column_dtypes': dtypes
        }

    def process(self, df):
        """Processes and cleans the dataset, filling missing values and dropping duplicates."""
        raw_records = len(df)
        missing_count = int(df.isnull().sum().sum())

        # Determine target column
        if self.target_column not in df.columns:
            # Fallback to last column if specified target isn't found
            self.target_column = df.columns[-1]

        # Drop duplicate records
        duplicate_count = int(df.duplicated().sum())
        clean_df = df.drop_duplicates().copy()

        # Separate feature columns
        feature_cols = [c for c in clean_df.columns if c != self.target_column]
        self.numerical_cols = clean_df[feature_cols].select_dtypes(include=[np.number]).columns.tolist()
        self.categorical_cols = clean_df[feature_cols].select_dtypes(exclude=[np.number]).columns.tolist()

        # Fill missing values
        self.imputation_values = {}
        for col in self.numerical_cols:
            median_val = clean_df[col].median()
            if pd.isna(median_val):
                median_val = 0.0
            self.imputation_values[col] = float(median_val)
            clean_df[col] = clean_df[col].fillna(median_val)

        for col in self.categorical_cols:
            mode_series = clean_df[col].mode()
            mode_val = mode_series[0] if not mode_series.empty else 'Unknown'
            self.imputation_values[col] = str(mode_val)
            clean_df[col] = clean_df[col].fillna(mode_val)

        # Drop rows where target is NaN if any exist
        clean_df = clean_df.dropna(subset=[self.target_column])
        clean_records = len(clean_df)

        self.stats = {
            'total_records': raw_records,
            'missing_values': missing_count,
            'duplicate_records': duplicate_count,
            'clean_records': clean_records,
            'target_column': self.target_column,
            'numerical_cols': self.numerical_cols,
            'categorical_cols': self.categorical_cols
        }

        return clean_df, self.stats

    def prepare_encoded_features(self, df):
        """Encodes categorical features and target variable for model training."""
        X = df[self.numerical_cols + self.categorical_cols].copy()
        y = df[self.target_column].copy()

        # Encode categorical inputs
        self.label_encoders = {}
        X_encoded = X.copy()

        for col in self.categorical_cols:
            le = LabelEncoder()
            X_encoded[col] = le.fit_transform(X_encoded[col].astype(str))
            self.label_encoders[col] = le

        # Encode target
        self.target_encoder = LabelEncoder()
        y_encoded = self.target_encoder.fit_transform(y.astype(str))

        return X_encoded, y_encoded

    def transform_single_input(self, input_dict):
        """Transforms a single prediction request dictionary to match feature format."""
        processed = {}

        # Fill numericals or default to imputation value
        for col in self.numerical_cols:
            val = input_dict.get(col, self.imputation_values.get(col, 0.0))
            try:
                processed[col] = float(val)
            except (ValueError, TypeError):
                processed[col] = float(self.imputation_values.get(col, 0.0))

        # Encode categoricals or map unseen values
        for col in self.categorical_cols:
            val = str(input_dict.get(col, self.imputation_values.get(col, 'Unknown')))
            le = self.label_encoders.get(col)
            if le is not None:
                if val in le.classes_:
                    processed[col] = int(le.transform([val])[0])
                else:
                    # Default to index 0 if unseen category
                    processed[col] = 0
            else:
                processed[col] = 0

        # Construct DataFrame in exact feature order
        ordered_cols = self.numerical_cols + self.categorical_cols
        row_df = pd.DataFrame([processed])[ordered_cols]
        return row_df
