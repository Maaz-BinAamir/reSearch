from math import ceil
import pandas as pd

# Loading the inverted index
inverted_index_df = pd.read_csv("inverted_index.csv")

# Converting WordId to integers
inverted_index_df["WordId"] = inverted_index_df["WordId"].astype(int)

min_word_id = 1
max_word_id = inverted_index_df["WordId"].max()

# Since each lexicon is continous w.r.t word ids and every word id of lexicon is present in inverted index
lexicon_size = max_word_id - min_word_id + 1

# Calculating the number of barrels based on lexicon size divided by 1000
barrel_size = 1000
# Ceiling division to ensure all words are covered
num_barrels = ceil(lexicon_size  / barrel_size)

# Creating barrels and exporting each to a separate CSV file
for i in range(num_barrels):
    lower_bound = min_word_id + i * barrel_size
    upper_bound = lower_bound + barrel_size - 1 if i < num_barrels - 1 else max_word_id

    # Filtering rows for the current barrel
    barrel_df = inverted_index_df[
        (inverted_index_df["WordId"] >= lower_bound) &
        (inverted_index_df["WordId"] <= upper_bound)
    ]

    # Exporting the barrel to a CSV file
    barrel_df.to_csv(f"barrels/barrel_{i + 1}.csv", index=False)

    # print(f"Barrel {i + 1}: WordIds {lower_bound} to {upper_bound}")