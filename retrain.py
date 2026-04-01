import pandas as pd
import numpy as np
import pickle
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, 'Global Green House Gas Emissions.csv')

# Load Historical Data
df_wide = pd.read_csv(CSV_PATH)
id_vars = ['Area', 'Year']
value_vars = ['Emissions (CH4)', 'Emissions (CO2)', 'Emissions (N2O)']
df = df_wide.melt(id_vars=id_vars, value_vars=value_vars, var_name='Element', value_name='Value')
df.dropna(subset=['Value'], inplace=True)

# Encode categorical
area_encoder = LabelEncoder()
element_encoder = LabelEncoder()

df['Area'] = area_encoder.fit_transform(df['Area'].astype(str))
df['Element'] = element_encoder.fit_transform(df['Element'].astype(str))

# Prepare X, y
# We must ensure column order matches what we expect during prediction:
# The notebook had columns: Area, Element, Year usually? 
# Wait, what was the column order in the notebook's df?
# Usually, df.columns were Area, Element, Year, Value.
# But here, melt produces Area, Year, Element, Value.
# Let's just use explicit column list to be safe.
features = ['Area', 'Year', 'Element']
X = df[features]
y = df['Value']

print("Training Random Forest Regressor...")
rf = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
rf.fit(X, y)

print("Saving models...")
with open(os.path.join(BASE_DIR, 'random_forest.pkl'), 'wb') as f:
    pickle.dump(rf, f)
with open(os.path.join(BASE_DIR, 'area_encoder.pkl'), 'wb') as f:
    pickle.dump(area_encoder, f)
with open(os.path.join(BASE_DIR, 'element_encoder.pkl'), 'wb') as f:
    pickle.dump(element_encoder, f)

print("Done. R^2 score on training data:", rf.score(X, y))
