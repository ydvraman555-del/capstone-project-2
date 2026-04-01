import pickle
import traceback

try:
    with open('models_info.txt', 'w') as out:
        with open('model.pkl', 'rb') as f:
            m = pickle.load(f)
        out.write(f"Model: {type(m)}\n")
        out.write(f"Model features: {getattr(m, 'feature_names_in_', 'no features_in_')}\n")
        
        with open('label_encoder.pkl', 'rb') as f:
            le = pickle.load(f)
        out.write(f"Label Encoder: {type(le)}\n")
        out.write(f"LE classes: {getattr(le, 'classes_', 'no classes_')}\n")
        
        try:
            with open('scaler.pkl', 'rb') as f:
                sc = pickle.load(f)
            out.write(f"Scaler: {type(sc)}\n")
            out.write(f"Scaler features: {getattr(sc, 'feature_names_in_', 'no features_in_')}\n")
        except FileNotFoundError:
            out.write("No scaler.pkl found\n")
except Exception as e:
    with open('models_info.txt', 'a') as out:
        out.write(traceback.format_exc())
