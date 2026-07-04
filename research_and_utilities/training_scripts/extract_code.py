import json
import traceback

try:
    with open('Practice Capstone Project .ipynb', 'r', encoding='utf-8') as f:
        nb = json.load(f)

    with open('model_training_code.txt', 'w', encoding='utf-8') as out:
        for cell in nb['cells']:
            if cell['cell_type'] == 'code':
                src = "".join(cell['source'])
                if 'train_test_split' in src or 'RandomForestC' in src or 'RandomForestR' in src or 'X =' in src or 'y =' in src:
                    out.write(src)
                    out.write("\n" + "-"*50 + "\n")
except Exception as e:
    print(traceback.format_exc())
