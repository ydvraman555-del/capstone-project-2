"""
Fast Model Loader — Drop-in replacement for model loading in app.py.

HOW TO USE (when ready to implement):
    In backend/app.py, replace the model loading block with:
    
        from fast_loader import load_all_artifacts
        model, area_encoder, element_encoder = load_all_artifacts()

This loads from the compressed rf.pkl.gz (~39MB) instead of 
random_forest.pkl (~186MB), cutting cold start time significantly.
"""

import pickle
import gzip
import os
import time
import sys

# NumPy 2.x to 1.x compatibility patch for unpickling models
try:
    import numpy._core as _core
except ModuleNotFoundError:
    import numpy.core as _core
    sys.modules['numpy._core'] = _core


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Paths — try compressed first, fallback to uncompressed
MODEL_COMPRESSED = os.path.join(BASE_DIR, 'rf.pkl.gz')
MODEL_ORIGINAL = os.path.join(BASE_DIR, 'random_forest.pkl')
AREA_ENCODER_PATH = os.path.join(BASE_DIR, 'area_encoder.pkl')
ELEMENT_ENCODER_PATH = os.path.join(BASE_DIR, 'element_encoder.pkl')


def load_model():
    """
    Load the RandomForest model.
    Tries compressed (.gz) first for faster loading, 
    falls back to original .pkl if .gz not found.
    """
    if os.path.exists(MODEL_COMPRESSED):
        print(f"Loading compressed model from rf.pkl.gz...")
        start = time.time()
        with gzip.open(MODEL_COMPRESSED, 'rb') as f:
            model = pickle.load(f)
        elapsed = time.time() - start
        print(f"  Model loaded in {elapsed:.2f}s (compressed)")
        return model
    
    elif os.path.exists(MODEL_ORIGINAL):
        print(f"Loading original model from random_forest.pkl...")
        start = time.time()
        with open(MODEL_ORIGINAL, 'rb') as f:
            model = pickle.load(f)
        elapsed = time.time() - start
        print(f"  Model loaded in {elapsed:.2f}s (original)")
        return model
    
    else:
        raise FileNotFoundError(
            "No model file found! Need rf.pkl.gz or random_forest.pkl"
        )


def load_encoders():
    """Load area and element encoders."""
    with open(AREA_ENCODER_PATH, 'rb') as f:
        area_encoder = pickle.load(f)
    with open(ELEMENT_ENCODER_PATH, 'rb') as f:
        element_encoder = pickle.load(f)
    print("  Encoders loaded ✓")
    return area_encoder, element_encoder


def load_all_artifacts():
    """
    Load all ML artifacts (model + encoders).
    Returns: (model, area_encoder, element_encoder)
    
    Usage in app.py:
        model, area_encoder, element_encoder = load_all_artifacts()
    """
    print("=" * 40)
    print("LOADING ML ARTIFACTS")
    print("=" * 40)
    
    start = time.time()
    model = load_model()
    area_encoder, element_encoder = load_encoders()
    total = time.time() - start
    
    print(f"  All artifacts loaded in {total:.2f}s")
    print("=" * 40)
    
    return model, area_encoder, element_encoder
