import pandas as pd
from flask import Blueprint, jsonify
from config import DEFAULT_TARGET_COLUMN
from routes.dataset_routes import get_current_df

analysis_bp = Blueprint('analysis', __name__)

@analysis_bp.route('/api/analysis/pests', methods=['GET'])
def get_pest_distribution():
    try:
        df = get_current_df()
        target_col = DEFAULT_TARGET_COLUMN if DEFAULT_TARGET_COLUMN in df.columns else df.columns[-1]

        counts = df[target_col].value_counts().to_dict()
        distribution = [{'pest': str(pest), 'count': int(count)} for pest, count in counts.items()]

        return jsonify({
            'target_column': target_col,
            'distribution': distribution
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analysis_bp.route('/api/analysis/environment', methods=['GET'])
def get_environment_analysis():
    try:
        df = get_current_df()
        target_col = DEFAULT_TARGET_COLUMN if DEFAULT_TARGET_COLUMN in df.columns else df.columns[-1]

        env_cols = ['Temperature', 'Humidity', 'Rainfall', 'Soil_Moisture', 'Wind_Speed']
        avail_env = [c for c in env_cols if c in df.columns]

        # Group averages by pest type
        grouped = df.groupby(target_col)[avail_env].mean().round(2).reset_index()
        records = grouped.to_dict(orient='records')

        # Scatter sample points (first 200 rows for scatter plots)
        scatter_sample = df[[target_col] + avail_env].dropna().head(250).to_dict(orient='records')

        return jsonify({
            'available_env_cols': avail_env,
            'pest_averages': records,
            'scatter_sample': scatter_sample
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analysis_bp.route('/api/analysis/growth-stage', methods=['GET'])
def get_growth_stage_analysis():
    try:
        df = get_current_df()
        target_col = DEFAULT_TARGET_COLUMN if DEFAULT_TARGET_COLUMN in df.columns else df.columns[-1]

        if 'Growth_Stage' not in df.columns:
            return jsonify({'available': False, 'message': 'Growth_Stage attribute not present in dataset'})

        # Cross tab Growth_Stage vs Pest_Type
        ct = pd.crosstab(df['Growth_Stage'], df[target_col])
        result = []
        for stage in ct.index:
            row = {'growth_stage': str(stage)}
            for pest in ct.columns:
                row[str(pest)] = int(ct.loc[stage, pest])
            result.append(row)

        return jsonify({
            'available': True,
            'pests': [str(c) for c in ct.columns],
            'growth_stages': result
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@analysis_bp.route('/api/analysis/seasonal', methods=['GET'])
def get_seasonal_analysis():
    try:
        df = get_current_df()
        target_col = DEFAULT_TARGET_COLUMN if DEFAULT_TARGET_COLUMN in df.columns else df.columns[-1]

        if 'Season' not in df.columns:
            return jsonify({'available': False, 'message': 'Season attribute not present in dataset'})

        ct = pd.crosstab(df['Season'], df[target_col])
        result = []
        for season in ct.index:
            row = {'season': str(season)}
            for pest in ct.columns:
                row[str(pest)] = int(ct.loc[season, pest])
            result.append(row)

        return jsonify({
            'available': True,
            'pests': [str(c) for c in ct.columns],
            'seasonal_trends': result
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
