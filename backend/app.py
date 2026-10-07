import os
from flask import Flask, jsonify
from flask_cors import CORS

from database import init_db
from routes.dataset_routes import dataset_bp
from routes.preprocess_routes import preprocess_bp
from routes.analysis_routes import analysis_bp
from routes.model_routes import model_bp
from routes.predict_routes import predict_bp

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize SQLite database
    init_db()

    # Register blueprints
    app.register_blueprint(dataset_bp)
    app.register_blueprint(preprocess_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(model_bp)
    app.register_blueprint(predict_bp)

    @app.route('/', methods=['GET'])
    @app.route('/api', methods=['GET'])
    def root_api():
        return jsonify({
            'system': 'Corn Crop Pest Infestation Prediction Backend REST API',
            'status': 'online',
            'frontend_url': 'http://localhost:3000',
            'message': 'Backend REST API is active. Open http://localhost:3000 for the web application interface.',
            'endpoints': [
                '/api/health',
                '/api/dataset/statistics',
                '/api/dataset/preview',
                '/api/dataset/columns',
                '/api/preprocess',
                '/api/analysis/pests',
                '/api/analysis/environment',
                '/api/analysis/growth-stage',
                '/api/analysis/seasonal',
                '/api/train',
                '/api/models',
                '/api/model/evaluation',
                '/api/feature-importance',
                '/api/predict',
                '/api/predictions'
            ]
        })

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'system': 'Corn Crop Pest Infestation Prediction API',
            'version': '1.0.0'
        })

    @app.errorhandler(404)
    def not_found_handler(e):
        return jsonify({
            'error': '404 Not Found',
            'message': 'The requested route was not found on the Flask API server.',
            'frontend_ui_url': 'http://localhost:3000',
            'note': 'To access the web application interface, please open http://localhost:3000 in your browser.'
        }), 404

    return app

app = create_app()

if __name__ == '__main__':
    # Default port 5000
    port = int(os.environ.get('PORT', 5000))
    print(f"Starting Corn Crop Pest Infestation Backend Server on http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
