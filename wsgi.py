import os
import sys

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import Flask app from backend
from app import app

# Serve static files from frontend/dist
static_dir = os.path.join(os.path.dirname(__file__), 'frontend', 'dist')

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react(path):
    """Serve React app, fallback to index.html for client-side routing"""
    from flask import send_from_directory
    
    # API routes are handled by Flask
    if path.startswith('api/') or path.startswith('predict') or path.startswith('forecast') or path.startswith('metadata'):
        return app.view_functions.get(request.endpoint)(request)
    
    # Serve static files
    if path != '' and os.path.exists(os.path.join(static_dir, path)):
        return send_from_directory(static_dir, path)
    
    # Fallback to index.html for SPA routing
    return send_from_directory(static_dir, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
