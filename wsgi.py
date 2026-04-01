import os
import sys
from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'frontend', 'dist'), static_url_path='')
CORS(app)

# Try to load the Flask app from backend
try:
    from app import model, area_encoder, element_encoder, df_history, get_smart_prediction
    BACKEND_AVAILABLE = True
except Exception as e:
    print(f"Warning: Could not load backend: {e}")
    BACKEND_AVAILABLE = False

# Serve React static files
static_dir = os.path.join(os.path.dirname(__file__), 'frontend', 'dist')

@app.route('/')
def serve_index():
    index_path = os.path.join(static_dir, 'index.html')
    if os.path.exists(index_path):
        return send_from_directory(static_dir, 'index.html')
    return {'message': 'React app not built yet'}, 404

@app.route('/<path:path>')
def serve_static(path):
    file_path = os.path.join(static_dir, path)
    if os.path.isfile(file_path):
        return send_from_directory(static_dir, path)
    elif path.startswith('api/'):
        # Let API routes fall through
        return serve_index()
    return send_from_directory(static_dir, 'index.html')

# API Routes
@app.route('/api/predict', methods=['POST'])
def predict():
    if not BACKEND_AVAILABLE:
        return {'error': 'Backend not initialized'}, 503
    try:
        data = request.get_json()
        area, element, year = data.get('Area'), data.get('Element'), int(data.get('Year'))
        prediction = get_smart_prediction(area, element, year)
        
        if prediction > 10000:
            insight = 'High'
        elif prediction >= 1000:
            insight = 'Medium'
        else:
            insight = 'Low'
            
        return jsonify({'prediction': prediction, 'insight': insight, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/forecast', methods=['GET'])
def forecast():
    if not BACKEND_AVAILABLE:
        return {'error': 'Backend not initialized'}, 503
    try:
        area, element = request.args.get('area'), request.args.get('element')
        if df_history is None:
            return jsonify({'error': 'No data'}), 500
        hist_data = df_history[(df_history['Area'] == area) & (df_history['Element'] == element)].sort_values('Year')
        hist_list = hist_data[['Year', 'Value']].to_dict('records')
        forecast_list = []
        for year in range(2022, 2032):
            forecast_list.append({'Year': year, 'Value': get_smart_prediction(area, element, year)})
        return jsonify({'history': hist_list, 'forecast': forecast_list, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/metadata', methods=['GET'])
def get_metadata():
    if not BACKEND_AVAILABLE:
        return {'error': 'Backend not initialized'}, 503
    try:
        return jsonify({
            'areas': sorted(list(df_history['Area'].unique())),
            'elements': sorted(list(df_history['Element'].unique())),
            'years': list(range(1990, 2032))
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
