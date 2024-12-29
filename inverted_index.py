import pandas as pd
import orjson
import time
from collections import defaultdict
import os

# Paths to input forward index and output inverted index
forward_index_path = "D:\\code\\DSAProject\\reSearch\\forward_index.csv"
inverted_index_base_path = "D:\\code\\DSAProject\\reSearch\\barrels"

def create_inverted_index():
    # Create 120 empty barrels
    barrels = [defaultdict(list) for _ in range(120)]

    forward_index = pd.read_csv(forward_index_path)
    for _, row in forward_index.iterrows():
        doc_id = row["DocumentID"]
        byte_offset = row["byte_offset"]
        length = orjson.loads(row["length"])
        word_scores = orjson.loads(row["word_scores"])

        for word_id, data in word_scores.items():
            # Determine barrel index
            barrel_index = int(word_id) % 120  
            barrels[barrel_index][word_id].append({
                "DocumentID": doc_id,
                "byte_offset": byte_offset,
                "length": length,
                "frequency": data["frequency"],
            })

    return barrels

def save_barrels(barrels, base_path):
    if not os.path.exists(base_path):
        os.makedirs(base_path)

    for i, barrel in enumerate(barrels):
        barrel_path = os.path.join(base_path, f"barrel_{i}.parquet")
        export_data = [
            {"WordId": word_id, "DocumentDetails": orjson.dumps(details).decode("utf-8")}
            for word_id, details in barrel.items()
        ]
        barrel_df = pd.DataFrame(export_data)
        barrel_df.to_parquet(barrel_path, index=False, engine="pyarrow")
        print(f"Barrel {i} saved to: {barrel_path}")

if _name_ == "_main_":
    start_time = time.perf_counter()
    barrels = create_inverted_index()
    save_barrels(barrels, inverted_index_base_path)
    end_time = time.perf_counter()
    print(f"Time taken: {end_time - start_time:.2f} seconds")