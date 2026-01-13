"""
PiVitals - Raspberry Pi Health Monitoring Application
Main Flask application entry point
"""
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import get_config
from routes import metrics_bp, system_bp
import time
import psutil
import os


def create_app():
    """Application factory"""
    # Get the path to the frontend build directory
    frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))

    # Create Flask app with static folder configuration
    if os.path.exists(frontend_dist):
        app = Flask(__name__, static_folder=frontend_dist, static_url_path='')
    else:
        app = Flask(__name__)
        print(f"Warning: Frontend dist folder not found at {frontend_dist}")

    # Load configuration
    config_obj = get_config()
    app.config.from_object(config_obj)

    # Setup CORS
    CORS(app, origins=config_obj.CORS_ORIGINS)

    # Register blueprints
    app.register_blueprint(metrics_bp)
    app.register_blueprint(system_bp)

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

    # Serve frontend - Root endpoint now serves the React app
    @app.route('/', methods=['GET'])
    def index():
        """Serve the React frontend"""
        if os.path.exists(frontend_dist):
            return send_from_directory(frontend_dist, 'index.html')
        else:
            # Fallback to API info if frontend not built
            return jsonify({
                'name': 'PiVitals API',
                'version': app.config['APP_VERSION'],
                'message': 'Frontend not built. Run "cd frontend && npm run build"',
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

    # Serve frontend static assets
    @app.route('/<path:path>')
    def serve_static(path):
        """Serve static files from frontend build"""
        if os.path.exists(frontend_dist):
            # Check if file exists
            if os.path.exists(os.path.join(frontend_dist, path)):
                return send_from_directory(frontend_dist, path)
            else:
                # If file doesn't exist, serve index.html (for client-side routing)
                return send_from_directory(frontend_dist, 'index.html')
        return jsonify({'error': 'Frontend not built'}), 404

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        # For API routes, return JSON error
        if '/api/' in str(error):
            return jsonify({'error': 'Not found'}), 404
        # For other routes, try to serve the frontend
        if os.path.exists(frontend_dist):
            return send_from_directory(frontend_dist, 'index.html')
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
