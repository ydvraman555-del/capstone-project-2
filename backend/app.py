from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os
import pandas as pd
import sys
import json

# Custom Unpickler to handle NumPy 1.x / 2.x cross-version loading
class NumPyRenameUnpickler(pickle.Unpickler):
    def find_class(self, module, name):
        if module.startswith("numpy._core"):
            module = module.replace("numpy._core", "numpy.core")
        return super().find_class(module, name)

# Update Flask initialization to serve frontend dist from the parent directory
app = Flask(__name__, 
            static_folder=os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend', 'dist'),
            static_url_path='/')
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Note: Using the model and encoders from the root directory as per the "Clean Rebuild" plan
MODEL_PATH = os.path.join(os.path.dirname(BASE_DIR), 'random_forest.pkl')
AREA_ENCODER_PATH = os.path.join(os.path.dirname(BASE_DIR), 'area_encoder.pkl')
ELEMENT_ENCODER_PATH = os.path.join(os.path.dirname(BASE_DIR), 'element_encoder.pkl')
CSV_PATH = os.path.join(os.path.dirname(BASE_DIR), 'Global Green House Gas Emissions.csv')
EVENTS_PATH = os.path.join(BASE_DIR, 'historical_events.json')

# Load historical events database
try:
    with open(EVENTS_PATH, 'r', encoding='utf-8') as f:
        events_db = json.load(f)
    print("SUCCESS: Historical events database loaded.")
except Exception as e:
    print(f"ERROR loading historical events: {e}")
    events_db = {}

import threading

# Lazy loading variables for ML artifacts
model = None
area_encoder = None
element_encoder = None
model_lock = threading.Lock()

def load_artifacts_lazy():
    global model, area_encoder, element_encoder
    if model is None or area_encoder is None or element_encoder is None:
        with model_lock:
            if model is None or area_encoder is None or element_encoder is None:
                import gzip
                MODEL_GZ_PATH = os.path.join(os.path.dirname(BASE_DIR), 'rf.pkl.gz')
                try:
                    if os.path.exists(MODEL_GZ_PATH):
                        print("Loading compressed model from rf.pkl.gz...")
                        with gzip.open(MODEL_GZ_PATH, 'rb') as f:
                            model = NumPyRenameUnpickler(f).load()
                    else:
                        print("Loading original model from random_forest.pkl...")
                        with open(MODEL_PATH, 'rb') as f:
                            model = NumPyRenameUnpickler(f).load()
                            
                    with open(AREA_ENCODER_PATH, 'rb') as f:
                        area_encoder = NumPyRenameUnpickler(f).load()
                    with open(ELEMENT_ENCODER_PATH, 'rb') as f:
                        element_encoder = NumPyRenameUnpickler(f).load()
                    print("SUCCESS: Model and Encoders loaded (lazy).")
                except Exception as e:
                    print(f"ERROR loading artifacts (lazy): {e}")
                    raise e



# Load Historical Data
try:
    df_wide = pd.read_csv(CSV_PATH)
    id_vars = ['Area', 'Year']
    value_vars = ['Emissions (CH4)', 'Emissions (CO2)', 'Emissions (N2O)']
    df_history = df_wide.melt(id_vars=id_vars, value_vars=value_vars, var_name='Element', value_name='Value')
    df_history.dropna(subset=['Value'], inplace=True)
    print("SUCCESS: Historical data loaded.")
except Exception as e:
    print(f"ERROR loading CSV data: {e}")
    df_history = None

def get_smart_prediction(area, element, target_year):
    # Determine the end of historical training data
    TRAIN_END_YEAR = 2021
    
    # Check if the year exists in history first for maximum accuracy/consistency
    if df_history is not None:
        hist_match = df_history[(df_history['Area'] == area) & (df_history['Element'] == element)]
        year_match = hist_match[hist_match['Year'] == target_year]
        if not year_match.empty:
            return float(year_match.iloc[0]['Value'])
            
    # If the year is in the past but missing from CSV, or in the future, use the model
    try:
        load_artifacts_lazy()
        enc_area = area_encoder.transform([area])[0]
        enc_element = element_encoder.transform([element])[0]
        
        # RF anchor prediction
        X_pred = pd.DataFrame({'Area': [enc_area], 'Year': [target_year], 'Element': [enc_element]})
        # Ensure column order matches training ['Area', 'Year', 'Element']
        X_pred = X_pred[['Area', 'Year', 'Element']]
        base_prediction = float(model.predict(X_pred)[0])
        
        # Real-time dynamic slope adjustment for future targets (> 2021)
        if target_year > TRAIN_END_YEAR and df_history is not None:
            hist_match = df_history[(df_history['Area'] == area) & (df_history['Element'] == element)].sort_values('Year')
            recent = hist_match.tail(10)
            if len(recent) > 5:
                # Calculate real historical slope over the last 10 years
                slope = np.polyfit(recent['Year'], recent['Value'], 1)[0]
                # Apply continuous slope from the RF anchor
                years_ahead = target_year - TRAIN_END_YEAR
                dynamic_pred = base_prediction + (slope * years_ahead)
                return float(max(0, dynamic_pred)) 
                
        return base_prediction
    except Exception as e:
        # Improved fallback trend for future years (> 2021)
        if target_year > TRAIN_END_YEAR and df_history is not None:
            hist_match = df_history[(df_history['Area'] == area) & (df_history['Element'] == element)].sort_values('Year')
            if len(hist_match) > 0:
                last_year = hist_match.iloc[-1]['Year']
                last_val = hist_match.iloc[-1]['Value']
                # Calculate simple trend 2% growth if model fails
                slope = 0.02 * last_val
                years_ahead = target_year - last_year
                return float(max(0, last_val + (slope * years_ahead)))
                
        # If year is in the past, return the closest available data instead of defaulting to 2021
        if df_history is not None:
            hist_match = df_history[(df_history['Area'] == area) & (df_history['Element'] == element)].sort_values('Year')
            if len(hist_match) > 0:
                # Find closest historical point
                closest = hist_match.iloc[(hist_match['Year']-target_year).abs().argsort()[:1]]
                return float(closest.iloc[0]['Value'])
                
        return 0.0 # Extreme fallback 


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        area, element, year = data.get('Area'), data.get('Element'), int(data.get('Year'))
        prediction = get_smart_prediction(area, element, year)
        
        # Calculate Threat Level (Insight)
        if prediction > 10000:
            insight = 'High'
        elif prediction >= 1000:
            insight = 'Medium'
        else:
            insight = 'Low'
            
        return jsonify({'prediction': prediction, 'insight': insight, 'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/events', methods=['GET'])
def get_events():
    area = request.args.get('area')
    element = request.args.get('element')
    
    if df_history is None:
        return jsonify({'error': 'No historical data loaded'}), 500
        
    hist_data = df_history[(df_history['Area'] == area) & (df_history['Element'] == element)].sort_values('Year')
    
    if hist_data.empty:
        return jsonify({'status': 'no_data', 'events': [], 'drivers': 'No drivers found.'})
        
    # Find Peak
    peak_row = hist_data.loc[hist_data['Value'].idxmax()]
    peak_year = int(peak_row['Year'])
    peak_val = float(peak_row['Value'])
    
    # Find Trough (Lowest)
    trough_row = hist_data.loc[hist_data['Value'].idxmin()]
    trough_year = int(trough_row['Year'])
    trough_val = float(trough_row['Value'])
    
    country_data = events_db.get(area, events_db.get("default", {}))
    gas_data = country_data.get(element, events_db.get("default", {}).get(element, {}))
    
    drivers = gas_data.get("drivers", "General economic and demographic drivers.")
    peak_cause = gas_data.get("peak_cause", "Historical peak in production activity.")
    drop_cause = gas_data.get("drop_cause", "Introduction of mitigation programs and improved efficiencies.")
    mitigation = gas_data.get("mitigation", ["General emissions reduction pathways."])
    
    timeline = [
        {
            "year": peak_year,
            "type": "peak",
            "title": f"Peak Emissions ({peak_val:,.1f} kt)",
            "description": f"Emissions reached an all-time high of {peak_val:,.1f} kilotonnes. {peak_cause}"
        },
        {
            "year": trough_year,
            "type": "trough",
            "title": f"Lowest Recorded Emissions ({trough_val:,.1f} kt)",
            "description": f"Emissions hit a historical low of {trough_val:,.1f} kilotonnes. {drop_cause}"
        }
    ]
    
    # Sort chronologically
    timeline = sorted(timeline, key=lambda x: x['year'])
    
    return jsonify({
        "status": "success",
        "area": area,
        "element": element,
        "drivers": drivers,
        "timeline": timeline,
        "mitigation": mitigation
    })

@app.route('/forecast', methods=['GET'])
def forecast():
    area, element = request.args.get('area'), request.args.get('element')
    if df_history is None: return jsonify({'error': 'No data'}), 500
    hist_data = df_history[(df_history['Area'] == area) & (df_history['Element'] == element)].sort_values('Year')
    hist_list = hist_data[['Year', 'Value']].to_dict('records')
    forecast_list = []
    for year in range(2022, 2051):
        forecast_list.append({'Year': year, 'Value': get_smart_prediction(area, element, year)})
    return jsonify({'history': hist_list, 'forecast': forecast_list, 'status': 'success'})

@app.route('/metadata', methods=['GET'])
def get_metadata():
    return jsonify({
        'areas': sorted(list(df_history['Area'].unique())),
        'elements': sorted(list(df_history['Element'].unique())),
        'years': list(range(1990, 2051))
    })

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path == "":
        if os.path.exists(os.path.join(app.static_folder, 'index.html')):
            return app.send_static_file('index.html')
        return jsonify({
            "status": "healthy",
            "service": "Global GHG Emissions Intelligence System API",
            "message": "To access the UI, visit the Vercel deployment."
        }), 200

    if os.path.exists(os.path.join(app.static_folder, path)):
        return app.send_static_file(path)
    else:
        if os.path.exists(os.path.join(app.static_folder, 'index.html')):
            return app.send_static_file('index.html')
        return jsonify({"error": f"Path /{path} not found on server"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
