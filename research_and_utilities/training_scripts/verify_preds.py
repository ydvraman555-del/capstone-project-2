import sys
import os
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from backend.app import get_smart_prediction

tests = [
    ('Afghanistan', 'Emissions (CH4)', 1994, 235.5),
    ('Afghanistan', 'Emissions (CH4)', 2021, 425.3),
    ('Afghanistan', 'Emissions (CO2)', 2005, 9.8),
    ('Afghanistan', 'Emissions (CO2)', 2021, 108.3)
]

for area, element, year, expected in tests:
    result = get_smart_prediction(area, element, year)
    print(f"{area} | {element} | {year} -> Predicted: {result:.1f} (Expected ~{expected})")
