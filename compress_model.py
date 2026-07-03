"""
Compress the RandomForest model to reduce cold start time.
Run this once to create/update rf.pkl.gz from random_forest.pkl.

Usage:
    python compress_model.py
"""

import pickle
import gzip
import os
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SOURCE = os.path.join(BASE_DIR, 'random_forest.pkl')
COMPRESSED = os.path.join(BASE_DIR, 'rf.pkl.gz')

def compress():
    print(f"Loading model from: {SOURCE}")
    start = time.time()
    
    with open(SOURCE, 'rb') as f:
        model = pickle.load(f)
    
    load_time = time.time() - start
    source_size = os.path.getsize(SOURCE) / (1024 * 1024)
    print(f"  Loaded in {load_time:.2f}s ({source_size:.1f} MB)")
    
    print(f"Compressing to: {COMPRESSED}")
    start = time.time()
    
    with gzip.open(COMPRESSED, 'wb', compresslevel=6) as f:
        pickle.dump(model, f)
    
    compress_time = time.time() - start
    compressed_size = os.path.getsize(COMPRESSED) / (1024 * 1024)
    ratio = (1 - compressed_size / source_size) * 100
    
    print(f"  Compressed in {compress_time:.2f}s ({compressed_size:.1f} MB)")
    print(f"  Size reduction: {ratio:.1f}%")
    print(f"\nDone! Use rf.pkl.gz in app.py for faster cold starts.")

def verify():
    """Verify compressed model loads correctly and produces same results."""
    print("\nVerifying compressed model...")
    
    with open(SOURCE, 'rb') as f:
        original = pickle.load(f)
    
    start = time.time()
    with gzip.open(COMPRESSED, 'rb') as f:
        compressed = pickle.load(f)
    gz_load_time = time.time() - start
    print(f"  Compressed model loads in {gz_load_time:.2f}s")
    
    # Quick prediction test
    import numpy as np
    test_input = np.array([[0, 2020, 0]])  # dummy input
    pred_orig = original.predict(test_input)[0]
    pred_comp = compressed.predict(test_input)[0]
    
    if abs(pred_orig - pred_comp) < 0.001:
        print(f"  Predictions match! ✓")
    else:
        print(f"  WARNING: Predictions differ! {pred_orig} vs {pred_comp}")


if __name__ == '__main__':
    compress()
    verify()
