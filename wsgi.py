import os
from flask import Flask, send_from_directory
import sys

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app import app as flask_app

# Serve React static files
static_dir = os.path.join(os.path.dirname(__file__), 'frontend', 'dist')

@flask_app.route('/')
def serve_index():
    return send_from_directory(static_dir, 'index.html')

@flask_app.route('/<path:path>')
def serve_static(path):
    if os.path.isfile(os.path.join(static_dir, path)):
        return send_from_directory(static_dir, path)
    return send_from_directory(static_dir, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    flask_app.run(host='0.0.0.0', port=port, debug=False)
