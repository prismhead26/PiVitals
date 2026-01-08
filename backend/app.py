"""
PiVitals - Raspberry Pi Health Monitoring Application
Main Flask application entry point
"""
from flask import Flask, jsonify
from flask_cors import CORS
from config import get_config
from routes import metrics_bp
import time
import psutil


def create_app():
    """Application factory"""
    app = Flask(__name__)

    # Load configuration
    config_obj = get_config()
    app.config.from_object(config_obj)

    # Setup CORS
    CORS(app, origins=config_obj.CORS_ORIGINS)

    # Register blueprints
    app.register_blueprint(metrics_bp)

    # Store app start time
    app.config['START_TIME'] = time.time()

    # Health check endpoint
    @app.route('/api/v1/health', methods=['GET'])
    def health():
        """Health check endpoint"""
        uptime = int(time.time() - app.config['START_TIME'])
        return jsonify({
            'status': 'healthy',
            'version': app.config['APP_VERSION'],
            'uptime': uptime,
            'uptime_formatted': format_uptime(uptime)
        }), 200

    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        """Root endpoint"""
        return jsonify({
            'name': 'PiVitals API',
            'version': app.config['APP_VERSION'],
            'endpoints': {
                'health': '/api/v1/health',
                'metrics': {
                    'cpu': '/api/v1/metrics/cpu',
                    'memory': '/api/v1/metrics/memory',
                    'disk': '/api/v1/metrics/disk',
                    'network': '/api/v1/metrics/network',
                    'all': '/api/v1/metrics/all'
                }
            }
        }), 200

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500

    return app


def format_uptime(seconds):
    """Format uptime in human-readable format"""
    days = seconds // 86400
    hours = (seconds % 86400) // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60

    parts = []
    if days > 0:
        parts.append(f"{days}d")
    if hours > 0:
        parts.append(f"{hours}h")
    if minutes > 0:
        parts.append(f"{minutes}m")
    parts.append(f"{secs}s")

    return " ".join(parts)


# Create the application instance
app = create_app()


if __name__ == '__main__':
    config = get_config()
    print(f"Starting PiVitals on {config.HOST}:{config.PORT}")
    print(f"Environment: {config.FLASK_ENV}")
    print(f"Debug mode: {config.DEBUG}")
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG)
